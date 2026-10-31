import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueuePriority, QueueStatus, StationStatus, Prisma } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async getQueue(companyId: number) {
    return this.prisma.queueEntry.findMany({
      where: {
        companyId,
        status: { in: [QueueStatus.WAITING, QueueStatus.IN_SERVICE] },
      },
      include: {
        client: true,
        station: true,
        staff: { include: { user: true } },
      },
      orderBy: [
        { priority: 'desc' }, // URGENT > PRIORITY > NORMAL
        { position: 'asc' },
      ],
    });
  }

  async getStations(companyId: number) {
    return this.prisma.station.findMany({
      where: { companyId },
      include: {
        staff: { include: { user: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async registerArrival(
    companyId: number,
    data: {
      clientId: number;
      serviceName: string;
      priority?: QueuePriority;
      isAppointment?: boolean;
    },
  ) {
    const countToday = await this.prisma.queueEntry.count({
      where: { companyId },
    });

    const prefix = data.isAppointment ? '#A' : '#S';
    const ticketCode = `${prefix}-${String(100 + countToday + 1)}`;

    const lastPos = await this.prisma.queueEntry.findFirst({
      where: { companyId, status: QueueStatus.WAITING },
      orderBy: { position: 'desc' },
    });

    const position = (lastPos?.position || 0) + 1;

    return this.prisma.queueEntry.create({
      data: {
        companyId,
        clientId: data.clientId,
        ticketCode,
        serviceName: data.serviceName,
        priority: data.priority || QueuePriority.NORMAL,
        position,
        status: QueueStatus.WAITING,
      },
      include: { client: true },
    });
  }

  async assignStation(queueEntryId: number, stationId: number, staffId?: number) {
    const queueEntry = await this.prisma.queueEntry.findUnique({
      where: { id: queueEntryId },
      include: { client: true },
    });

    if (!queueEntry) {
      throw new NotFoundException('Entrée de file d’attente introuvable');
    }

    // Mettre la station en OCCUPIED
    await this.prisma.station.update({
      where: { id: stationId },
      data: {
        status: StationStatus.OCCUPIED,
        currentClient: queueEntry.client.name,
        progressPct: 10,
      },
    });

    return this.prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: {
        stationId,
        staffId,
        status: QueueStatus.IN_SERVICE,
        startedAt: new Date(),
      },
      include: { client: true, station: true, staff: true },
    });
  }

  async completeQueue(queueEntryId: number) {
    const queueEntry = await this.prisma.queueEntry.findUnique({
      where: { id: queueEntryId },
    });

    if (!queueEntry) {
      throw new NotFoundException('Entrée introuvable');
    }

    if (queueEntry.stationId) {
      await this.prisma.station.update({
        where: { id: queueEntry.stationId },
        data: {
          status: StationStatus.AVAILABLE,
          currentClient: null,
          progressPct: 0,
        },
      });
    }

    return this.prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: {
        status: QueueStatus.COMPLETED,
        endedAt: new Date(),
      },
    });
  }

  async getRatings(companyId: number) {
    return this.prisma.rating.findMany({
      where: { queueEntry: { companyId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async addRating(data: {
    queueEntryId?: number;
    targetType: string;
    targetName: string;
    clientName: string;
    score: number;
    comment?: string;
  }) {
    return this.prisma.rating.create({
      data,
    });
  }
}
