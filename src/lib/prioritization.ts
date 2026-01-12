import { Severity } from '@prisma/client';

export interface PriorityFactors {
  severity: Severity;
  fleetUtilization: number; // 0-100%
  routeCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  historicalRepairTime: number; // hours
  partsAvailability: boolean;
  driverExperience: 'NOVICE' | 'EXPERIENCED' | 'EXPERT';
  timeOfDay: number; // 0-23 hours
  dayOfWeek: number; // 0-6 (Sunday = 0)
}

export interface PriorityScore {
  score: number; // 0-100
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  reasoning: string[];
  recommendedAction: string;
  estimatedImpact: string;
}

export class SmartPrioritization {
  private static readonly SEVERITY_WEIGHTS = {
    LOW: 10,
    MEDIUM: 25,
    HIGH: 50,
    CRITICAL: 80
  };

  private static readonly ROUTE_WEIGHTS = {
    LOW: 5,
    MEDIUM: 15,
    HIGH: 25,
    CRITICAL: 35
  };

  private static readonly TIME_MULTIPLIERS = {
    // Peak hours (6-9 AM, 4-7 PM) get higher priority
    PEAK: 1.3,
    BUSINESS: 1.1,
    OFF_HOURS: 0.8,
    WEEKEND: 0.7
  };

  static calculatePriority(factors: PriorityFactors): PriorityScore {
    let score = 0;
    const reasoning: string[] = [];

    // Base severity score (40% weight)
    const severityScore = this.SEVERITY_WEIGHTS[factors.severity];
    score += severityScore * 0.4;
    reasoning.push(`${factors.severity} severity: +${Math.round(severityScore * 0.4)} points`);

    // Fleet utilization impact (20% weight)
    const utilizationScore = factors.fleetUtilization * 0.2;
    score += utilizationScore;
    if (factors.fleetUtilization > 85) {
      reasoning.push(`High fleet utilization (${factors.fleetUtilization}%): +${Math.round(utilizationScore)} points`);
    }

    // Route criticality (15% weight)
    const routeScore = this.ROUTE_WEIGHTS[factors.routeCriticality] * 0.15;
    score += routeScore;
    if (factors.routeCriticality !== 'LOW') {
      reasoning.push(`${factors.routeCriticality} route criticality: +${Math.round(routeScore)} points`);
    }

    // Historical repair complexity (10% weight)
    if (factors.historicalRepairTime > 8) {
      const complexityScore = Math.min(15, factors.historicalRepairTime - 8);
      score += complexityScore;
      reasoning.push(`Complex repair history (${factors.historicalRepairTime}h avg): +${complexityScore} points`);
    }

    // Parts availability (10% weight)
    if (!factors.partsAvailability) {
      score -= 10;
      reasoning.push('Parts not available: -10 points');
    }

    // Driver experience factor (5% weight)
    const driverMultiplier = {
      NOVICE: 1.2, // New drivers get higher priority for safety
      EXPERIENCED: 1.0,
      EXPERT: 0.9
    }[factors.driverExperience];
    
    if (driverMultiplier !== 1.0) {
      const adjustment = Math.round(score * (driverMultiplier - 1));
      score *= driverMultiplier;
      reasoning.push(`${factors.driverExperience} driver: ${adjustment > 0 ? '+' : ''}${adjustment} points`);
    }

    // Time-based multiplier
    const timeMultiplier = this.getTimeMultiplier(factors.timeOfDay, factors.dayOfWeek);
    if (timeMultiplier !== 1.0) {
      const adjustment = Math.round(score * (timeMultiplier - 1));
      score *= timeMultiplier;
      reasoning.push(`Time factor: ${adjustment > 0 ? '+' : ''}${adjustment} points`);
    }

    // Determine priority level and recommendations
    const priority = this.scoreToPriority(score);
    const recommendedAction = this.getRecommendedAction(priority, factors);
    const estimatedImpact = this.getEstimatedImpact(priority, factors);

    return {
      score: Math.round(score),
      priority,
      reasoning,
      recommendedAction,
      estimatedImpact
    };
  }

  private static getTimeMultiplier(hour: number, dayOfWeek: number): number {
    // Weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return this.TIME_MULTIPLIERS.WEEKEND;
    }

    // Peak hours (6-9 AM, 4-7 PM)
    if ((hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 19)) {
      return this.TIME_MULTIPLIERS.PEAK;
    }

    // Business hours (9 AM - 4 PM)
    if (hour >= 9 && hour <= 16) {
      return this.TIME_MULTIPLIERS.BUSINESS;
    }

    // Off hours
    return this.TIME_MULTIPLIERS.OFF_HOURS;
  }

  private static scoreToPriority(score: number): PriorityScore['priority'] {
    if (score >= 90) return 'EMERGENCY';
    if (score >= 70) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  private static getRecommendedAction(
    priority: PriorityScore['priority'], 
    _factors: PriorityFactors
  ): string {
    switch (priority) {
      case 'EMERGENCY':
        return 'Immediate response required. Dispatch emergency roadside assistance and notify operations manager.';
      case 'CRITICAL':
        return 'Schedule within 2 hours. Prepare replacement vehicle if needed.';
      case 'HIGH':
        return 'Schedule within 4 hours. Coordinate with parts department.';
      case 'MEDIUM':
        return 'Schedule within 24 hours during next available slot.';
      case 'LOW':
        return 'Schedule during next maintenance window or when convenient.';
      default:
        return 'Review and schedule appropriately.';
    }
  }

  private static getEstimatedImpact(
    priority: PriorityScore['priority'], 
    factors: PriorityFactors
  ): string {
    const utilizationImpact = factors.fleetUtilization > 85 ? 'High fleet impact' : 'Moderate fleet impact';
    const routeImpact = factors.routeCriticality === 'CRITICAL' ? 'Critical route disruption' : 'Standard route impact';

    switch (priority) {
      case 'EMERGENCY':
        return `Severe operational impact. ${utilizationImpact}. Immediate revenue loss risk.`;
      case 'CRITICAL':
        return `Significant operational impact. ${routeImpact}. Customer service risk.`;
      case 'HIGH':
        return `Moderate operational impact. ${utilizationImpact}. Schedule disruption likely.`;
      case 'MEDIUM':
        return `Minor operational impact. Can be managed with current resources.`;
      case 'LOW':
        return `Minimal operational impact. Preventive maintenance opportunity.`;
      default:
        return 'Impact assessment needed.';
    }
  }

  // Get fleet utilization rate for a specific fleet number
  static async getFleetUtilization(fleetNumber: string): Promise<number> {
    // This would integrate with fleet management system
    // For now, return a calculated value based on recent issues
    try {
      const response = await fetch(`/api/fleet/${fleetNumber}/utilization`);
      if (response.ok) {
        const data = await response.json();
        return data.utilization || 85; // Default to 85%
      }
    } catch (error) {
      console.error('Failed to get fleet utilization:', error);
    }
    return 85; // Default utilization
  }

  // Get route criticality for a fleet number
  static async getRouteCriticality(fleetNumber: string): Promise<PriorityFactors['routeCriticality']> {
    // This would integrate with route management system
    // For now, determine based on fleet number patterns
    const fleetNum = parseInt(fleetNumber);
    if (fleetNum >= 400 && fleetNum < 450) return 'CRITICAL'; // Express routes
    if (fleetNum >= 300 && fleetNum < 400) return 'HIGH';     // Priority routes
    if (fleetNum >= 200 && fleetNum < 300) return 'MEDIUM';   // Standard routes
    return 'LOW'; // Local/backup routes
  }

  // Get historical repair time for similar issues
  static async getHistoricalRepairTime(category: string, severity: Severity): Promise<number> {
    try {
      const response = await fetch(`/api/analytics/repair-time?category=${category}&severity=${severity}`);
      if (response.ok) {
        const data = await response.json();
        return data.averageHours || 4; // Default to 4 hours
      }
    } catch (error) {
      console.error('Failed to get historical repair time:', error);
    }
    return 4; // Default repair time
  }

  // Check parts availability
  static async checkPartsAvailability(category: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/inventory/check?category=${category}`);
      if (response.ok) {
        const data = await response.json();
        return data.available || false;
      }
    } catch (error) {
      console.error('Failed to check parts availability:', error);
    }
    return true; // Default to available
  }
}