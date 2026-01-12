import type { GearItem } from '~/types/activity';
import { NAV_SELECTORS } from '~/config/selectors';

/**
 * Get athlete ID from the navigation menu
 */
export function getAthleteId(): string | null {
  try {
    // 使用 XPath 查询
    const result = document.evaluate(
      NAV_SELECTORS.ATHLETE_ID_LINK,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    const trainingLink = result.singleNodeValue as HTMLAnchorElement | null;
    
    if (!trainingLink) {
      console.error('Training link not found');
      return null;
    }

    const href = trainingLink.getAttribute('href');
    if (!href) {
      console.error('Href not found on training link');
      return null;
    }

    // Extract athlete ID from href like "/athletes/154862811/training/log"
    const match = href.match(/\/athletes\/(\d+)\//);
    if (!match || !match[1]) {
      console.error('Could not extract athlete ID from href:', href);
      return null;
    }

    return match[1];
  } catch (error) {
    console.error('Error getting athlete ID:', error);
    return null;
  }
}

/**
 * Fetch shoes from Strava API
 */
export async function fetchShoes(): Promise<GearItem[]> {
  const athleteId = getAthleteId();
  if (!athleteId) {
    throw new Error('Could not get athlete ID');
  }

  const url = `https://www.strava.com/athletes/${athleteId}/gear/shoes`;
  
  try {
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shoes: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter out inactive shoes and map to GearItem format
    return data
      .filter((shoe: any) => shoe.active === true)
      .map((shoe: any) => ({
        id: shoe.id.toString(),
        name: shoe.display_name,
        distance: parseFloat(shoe.total_distance) || 0, // Distance is in meters
        retired: false, // Since we already filtered by active
      }));
  } catch (error) {
    console.error('Error fetching shoes:', error);
    throw error;
  }
}

/**
 * Fetch bikes from Strava API
 */
export async function fetchBikes(): Promise<GearItem[]> {
  const athleteId = getAthleteId();
  if (!athleteId) {
    throw new Error('Could not get athlete ID');
  }

  const url = `https://www.strava.com/athletes/${athleteId}/gear/bikes`;
  
  try {
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bikes: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter out inactive bikes and map to GearItem format
    return data
      .filter((bike: any) => bike.active === true)
      .map((bike: any) => ({
        id: bike.id.toString(),
        name: bike.display_name,
        distance: parseFloat(bike.total_distance) || 0, // Distance is in meters
        retired: false, // Since we already filtered by active
      }));
  } catch (error) {
    console.error('Error fetching bikes:', error);
    throw error;
  }
}

