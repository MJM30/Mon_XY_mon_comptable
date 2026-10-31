import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QueuePriority } from '@prisma/client';

@ApiTags('Pilotage Activité, File d’attente & Postes')
@Controller('activity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Lister la file d’attente interactive en temps réel' })
  async getQueue(@Request() req: any) {
    return this.activityService.getQueue(req.user.companyId);
  }

  @Get('stations')
  @ApiOperation({ summary: 'État des postes de prise en charge (Bureaux 1 à 6)' })
  async getStations(@Request() req: any) {
    return this.activityService.getStations(req.user.companyId);
  }

  @Post('queue/arrival')
  @ApiOperation({ summary: 'Enregistrer l’arrivée d’un client et imprimer/générer son ticket' })
  async registerArrival(
    @Request() req: any,
    @Body()
    body: {
      clientId: number;
      serviceName: string;
      priority?: QueuePriority;
      isAppointment?: boolean;
    },
  ) {
    return this.activityService.registerArrival(req.user.companyId, body);
  }

  @Post('queue/:id/assign')
  @ApiOperation({ summary: 'Assigner un ticket à un poste et collaborateur' })
  async assignStation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { stationId: number; staffId?: number },
  ) {
    return this.activityService.assignStation(id, body.stationId, body.staffId);
  }

  @Post('queue/:id/complete')
  @ApiOperation({ summary: 'Clôturer la prestation pour un ticket et libérer le poste' })
  async completeQueue(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.completeQueue(id);
  }

  @Get('ratings')
  @ApiOperation({ summary: 'Lister les évaluations clients et indices de satisfaction' })
  async getRatings(@Request() req: any) {
    return this.activityService.getRatings(req.user.companyId);
  }

  @Post('ratings')
  @ApiOperation({ summary: 'Enregistrer une note et avis client' })
  async addRating(
    @Body()
    body: {
      queueEntryId?: number;
      targetType: string;
      targetName: string;
      clientName: string;
      score: number;
      comment?: string;
    },
  ) {
    return this.activityService.addRating(body);
  }
}
