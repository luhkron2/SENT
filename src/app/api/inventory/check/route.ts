import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkSchema = z.object({
  category: z.string().optional(),
  partNumber: z.string().optional(),
  fleetNumber: z.string().optional(),
});

// Mock inventory data - in production this would connect to your parts management system
const MOCK_INVENTORY = {
  'Engine': {
    available: true,
    stock: 15,
    leadTime: '2-4 hours',
    supplier: 'Cummins Parts',
    estimatedCost: 850,
    commonParts: ['Oil Filter', 'Air Filter', 'Fuel Filter', 'Belts'],
    orderRequired: false,
    alternativeSupplier: undefined
  },
  'Brakes': {
    available: true,
    stock: 8,
    leadTime: '1-2 hours',
    supplier: 'Bendix Brake Parts',
    estimatedCost: 450,
    commonParts: ['Brake Pads', 'Brake Discs', 'Brake Fluid', 'Air Lines'],
    orderRequired: false,
    alternativeSupplier: undefined
  },
  'Transmission': {
    available: false,
    stock: 0,
    leadTime: '24-48 hours',
    supplier: 'Allison Transmission',
    estimatedCost: 1200,
    commonParts: ['Transmission Fluid', 'Filter Kit', 'Gasket Set'],
    orderRequired: true,
    alternativeSupplier: 'Interstate Parts - 3-5 days'
  },
  'Electrical': {
    available: true,
    stock: 25,
    leadTime: '30 minutes',
    supplier: 'Auto Electric Supply',
    estimatedCost: 120,
    commonParts: ['Fuses', 'Relays', 'Wiring Harness', 'Bulbs'],
    orderRequired: false,
    alternativeSupplier: undefined
  },
  'Suspension': {
    available: true,
    stock: 6,
    leadTime: '2-3 hours',
    supplier: 'Monroe Suspension',
    estimatedCost: 680,
    commonParts: ['Shock Absorbers', 'Springs', 'Bushings', 'Ball Joints'],
    orderRequired: false,
    alternativeSupplier: undefined
  },
  'Tires': {
    available: true,
    stock: 12,
    leadTime: '1 hour',
    supplier: 'Bridgestone Commercial',
    estimatedCost: 320,
    commonParts: ['Tire 295/75R22.5', 'Tire 385/65R22.5', 'Valve Stems', 'Wheel Weights'],
    orderRequired: false,
    alternativeSupplier: undefined
  },
  'Body': {
    available: true,
    stock: 20,
    leadTime: '1-4 hours',
    supplier: 'Commercial Body Parts',
    estimatedCost: 200,
    commonParts: ['Mirrors', 'Lights', 'Door Handles', 'Trim Pieces'],
    orderRequired: false,
    alternativeSupplier: undefined
  },
  'Other': {
    available: true,
    stock: 50,
    leadTime: '1-2 hours',
    supplier: 'General Parts Supply',
    estimatedCost: 150,
    commonParts: ['Fluids', 'Filters', 'Hardware', 'Cleaning Supplies'],
    orderRequired: false,
    alternativeSupplier: undefined
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const partNumber = searchParams.get('partNumber');
    const fleetNumber = searchParams.get('fleetNumber');

    // Validate input
    const validated = checkSchema.safeParse({
      category,
      partNumber,
      fleetNumber
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validated.error.issues },
        { status: 400 }
      );
    }

    // Check inventory based on category
    if (category && MOCK_INVENTORY[category as keyof typeof MOCK_INVENTORY]) {
      const inventory = MOCK_INVENTORY[category as keyof typeof MOCK_INVENTORY];
      
      return NextResponse.json({
        available: inventory.available,
        category,
        stock: inventory.stock,
        leadTime: inventory.leadTime,
        supplier: inventory.supplier,
        estimatedCost: inventory.estimatedCost,
        commonParts: inventory.commonParts,
        orderRequired: inventory.orderRequired || false,
        alternativeSupplier: inventory.alternativeSupplier,
        recommendations: inventory.available 
          ? [`${inventory.commonParts[0]} in stock`, `Ready for immediate repair`]
          : [`Order required from ${inventory.supplier}`, `Consider alternative: ${inventory.alternativeSupplier || 'Contact parts manager'}`]
      });
    }

    // Check specific part number
    if (partNumber) {
      // Mock part lookup
      const isAvailable = Math.random() > 0.3; // 70% availability rate
      
      return NextResponse.json({
        available: isAvailable,
        partNumber,
        stock: isAvailable ? Math.floor(Math.random() * 20) + 1 : 0,
        leadTime: isAvailable ? '1-2 hours' : '24-72 hours',
        supplier: 'Parts Warehouse',
        estimatedCost: Math.floor(Math.random() * 500) + 50,
        location: isAvailable ? 'Warehouse A-15' : 'Special Order Required'
      });
    }

    // Fleet-specific parts check
    if (fleetNumber) {
      const fleetNum = parseInt(fleetNumber);
      const isHighPriority = fleetNum >= 400; // Express fleet gets priority
      
      return NextResponse.json({
        available: true,
        fleetNumber,
        priorityLevel: isHighPriority ? 'HIGH' : 'STANDARD',
        commonIssues: [
          'Brake maintenance due',
          'Oil change recommended',
          'Tire rotation needed'
        ],
        partsOnHand: isHighPriority ? 95 : 85, // Percentage
        estimatedRepairTime: isHighPriority ? '2-3 hours' : '3-4 hours'
      });
    }

    // Default response
    return NextResponse.json({
      available: true,
      message: 'General parts availability check',
      overallStock: 85, // Percentage
      categories: Object.keys(MOCK_INVENTORY),
      recommendations: [
        'Most common parts in stock',
        'Emergency parts available 24/7',
        'Special orders typically 24-48 hours'
      ]
    });

  } catch (error) {
    console.error('Inventory check error:', error);
    return NextResponse.json(
      { error: 'Failed to check inventory' },
      { status: 500 }
    );
  }
}