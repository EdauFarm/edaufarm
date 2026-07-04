import { NextRequest, NextResponse } from 'next/server';

// Cache locations data for 24 hours (static data rarely changes)
export const revalidate = 86400; // 24 hours in seconds

// Kenya Counties and Major Towns/Cities
const KENYA_LOCATIONS = {
  counties: [
    { name: 'Nairobi', code: '047' },
    { name: 'Mombasa', code: '001' },
    { name: 'Kisumu', code: '042' },
    { name: 'Nakuru', code: '032' },
    { name: 'Kiambu', code: '022' },
    { name: 'Machakos', code: '016' },
    { name: 'Kajiado', code: '034' },
    { name: 'Uasin Gishu', code: '027' },
    { name: 'Kakamega', code: '037' },
    { name: 'Meru', code: '012' },
    { name: 'Kilifi', code: '003' },
    { name: 'Murang\'a', code: '021' },
    { name: 'Nyeri', code: '019' },
    { name: 'Bungoma', code: '039' },
    { name: 'Kwale', code: '002' },
    { name: 'Laikipia', code: '031' },
    { name: 'Nandi', code: '029' },
    { name: 'Embu', code: '014' },
    { name: 'Kericho', code: '035' },
    { name: 'Bomet', code: '036' },
    { name: 'Makueni', code: '017' },
    { name: 'Nyamira', code: '045' },
    { name: 'Baringo', code: '030' },
    { name: 'Trans Nzoia', code: '026' },
    { name: 'Busia', code: '040' },
    { name: 'Siaya', code: '041' },
    { name: 'Homa Bay', code: '043' },
    { name: 'Migori', code: '044' },
    { name: 'Kisii', code: '045' },
    { name: 'Narok', code: '033' },
    { name: 'Kajiado', code: '034' },
    { name: 'Kitui', code: '015' },
    { name: 'Tharaka Nithi', code: '013' },
    { name: 'Kirinyaga', code: '020' },
    { name: 'Nyandarua', code: '018' },
    { name: 'Vihiga', code: '038' },
    { name: 'Elgeyo Marakwet', code: '028' },
    { name: 'West Pokot', code: '024' },
    { name: 'Samburu', code: '025' },
    { name: 'Turkana', code: '023' },
    { name: 'Mandera', code: '009' },
    { name: 'Wajir', code: '010' },
    { name: 'Garissa', code: '007' },
    { name: 'Isiolo', code: '011' },
    { name: 'Marsabit', code: '008' },
    { name: 'Tana River', code: '004' },
    { name: 'Lamu', code: '005' },
    { name: 'Taita Taveta', code: '006' },
  ],
  
  cities: {
    'Nairobi': [
      'Nairobi Central',
      'Westlands',
      'Kasarani',
      'Embakasi',
      'Dagoretti',
      'Langata',
      'Kibra',
      'Roysambu',
      'Ruaraka',
      'Mathare',
      'Starehe',
      'Kamukunji',
      'Makadara',
      'Njiru',
    ],
    'Mombasa': [
      'Mombasa Island',
      'Likoni',
      'Changamwe',
      'Jomvu',
      'Kisauni',
      'Nyali',
    ],
    'Kisumu': [
      'Kisumu Central',
      'Kisumu East',
      'Kisumu West',
      'Seme',
      'Nyando',
      'Muhoroni',
    ],
    'Nakuru': [
      'Nakuru Town',
      'Naivasha',
      'Gilgil',
      'Molo',
      'Njoro',
      'Rongai',
    ],
    'Kiambu': [
      'Thika',
      'Ruiru',
      'Kikuyu',
      'Limuru',
      'Kiambu Town',
      'Gatundu',
      'Juja',
      'Githunguri',
    ],
    'Machakos': [
      'Machakos Town',
      'Athi River',
      'Kangundo',
      'Matungulu',
      'Kathiani',
      'Mavoko',
    ],
    'Kajiado': [
      'Kajiado Town',
      'Ngong',
      'Kitengela',
      'Isinya',
      'Loitokitok',
    ],
    'Uasin Gishu': [
      'Eldoret',
      'Turbo',
      'Moiben',
      'Soy',
    ],
    'Kakamega': [
      'Kakamega Town',
      'Mumias',
      'Butere',
      'Khwisero',
      'Lugari',
    ],
    'Meru': [
      'Meru Town',
      'Maua',
      'Nkubu',
      'Timau',
    ],
    'Kilifi': [
      'Kilifi Town',
      'Malindi',
      'Watamu',
      'Kaloleni',
    ],
  },
};

// GET: Fetch Kenya locations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const county = searchParams.get('county');
    const search = searchParams.get('search')?.toLowerCase();

    // Return all counties
    if (!county && !search) {
      return NextResponse.json({
        success: true,
        counties: KENYA_LOCATIONS.counties.map(c => c.name).sort(),
      });
    }

    // Search for counties or cities
    if (search) {
      const matchingCounties = KENYA_LOCATIONS.counties
        .filter(c => c.name.toLowerCase().includes(search))
        .map(c => c.name);

      const matchingCities: { county: string; city: string }[] = [];
      Object.entries(KENYA_LOCATIONS.cities).forEach(([countyName, cities]) => {
        cities.forEach(city => {
          if (city.toLowerCase().includes(search)) {
            matchingCities.push({ county: countyName, city });
          }
        });
      });

      return NextResponse.json({
        success: true,
        counties: matchingCounties,
        cities: matchingCities,
      });
    }

    // Return cities for a specific county
    if (county) {
      const cities = KENYA_LOCATIONS.cities[county as keyof typeof KENYA_LOCATIONS.cities] || [];
      return NextResponse.json(
        {
          success: true,
          county,
          cities: cities.sort(),
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        counties: KENYA_LOCATIONS.counties.map(c => c.name).sort(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
        },
      }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch locations', details: error.toString() },
      { status: 500 }
    );
  }
}
