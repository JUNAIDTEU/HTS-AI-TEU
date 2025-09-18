interface HtsResult {
  code: string;
  description: string;
  section?: string;
  chapter?: string;
  heading?: string;
  rates: {
    general: string;
    special?: string;
    column2?: string;
  };
  annexes?: {
    annexI?: { applicable: boolean; details: string[] };
    annexII?: { applicable: boolean; details: string[] };
    annexIII?: { applicable: boolean; details: string[] };
  };
  exclusions?: {
    description: string;
    conditions?: string[];
    applicableCountries?: string[];
  }[];
  additionalTariffs?: {
    section301?: {
      rate: string;
      description: string;
    }[];
    section232?: {
      rate: string;
      description: string;
    }[];
    pentenyl?: {
      rate: string;
      description: string;
      applicableCountries: string[];
    }[];
    ieepa?: {
      rate: string;
      description: string;
      type: 'Brazil' | 'RussianOil' | 'Other';
      applicableCountries: string[];
    }[];
    antidumping?: {
      rate: string;
      description: string;
      countries: string[];
    }[];
    countervailing?: {
      rate: string;
      description: string;
      countries: string[];
    }[];
  };
  notes?: string[];
}

async function searchHts(query: string): Promise<HtsResult | null> {
  try {
    const baseUrl = "https://hts.usitc.gov/api/search";
    const response = await fetch(`${baseUrl}?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse initial search results
    const searchData = await response.json();
    if (!searchData || !searchData.results || searchData.results.length === 0) {
      return null;
    }

    // Get details for the most relevant result
    const htsCode = searchData.results[0].htsno;
    const detailUrl = `https://hts.usitc.gov/api/classification/${htsCode}`;
    const detailResponse = await fetch(detailUrl);

    if (!detailResponse.ok) {
      throw new Error(`HTTP error! status: ${detailResponse.status}`);
    }

    const detailData = await detailResponse.json();

    // Format result
    const result: HtsResult = {
      code: htsCode,
      description: detailData.description || "",
      rates: {
        general: detailData.rates?.general || "N/A",
        special: detailData.rates?.special || undefined,
        column2: detailData.rates?.column2 || undefined,
      },
      additionalTariffs: {
        section301: [],
        section232: [],
        antidumping: [],
        countervailing: [],
      },
    };

    // Add section/chapter context if available
    if (detailData.section) {
      result.section = detailData.section;
    }
    if (detailData.chapter) {
      result.chapter = detailData.chapter;
    }
    if (detailData.heading) {
      result.heading = detailData.heading;
    }

    // Check for additional tariffs
    if (detailData.additionalDuties) {
      if (detailData.additionalDuties.section301) {
        result.additionalTariffs!.section301 = detailData.additionalDuties.section301.map(
          (duty: any) => ({
            rate: duty.rate,
            description: duty.description,
          })
        );
      }

      if (detailData.additionalDuties.section232) {
        result.additionalTariffs!.section232 = detailData.additionalDuties.section232.map(
          (duty: any) => ({
            rate: duty.rate,
            description: duty.description,
          })
        );
      }

      // Add antidumping and countervailing duties
      if (detailData.additionalDuties.antidumping) {
        result.additionalTariffs!.antidumping = detailData.additionalDuties.antidumping.map(
          (duty: any) => ({
            rate: duty.rate,
            description: duty.description,
            countries: duty.countries || [],
          })
        );
      }

      if (detailData.additionalDuties.countervailing) {
        result.additionalTariffs!.countervailing = detailData.additionalDuties.countervailing.map(
          (duty: any) => ({
            rate: duty.rate,
            description: duty.description,
            countries: duty.countries || [],
          })
        );
      }

      // Process Pentenyl tariffs
      if (detailData.additionalDuties.pentenyl) {
        result.additionalTariffs!.pentenyl = detailData.additionalDuties.pentenyl.map(
          (duty: any) => ({
            rate: duty.rate,
            description: duty.description,
            applicableCountries: duty.countries || [],
          })
        );
      }

      // Process IEEPA tariffs
      if (detailData.additionalDuties.ieepa) {
        result.additionalTariffs!.ieepa = detailData.additionalDuties.ieepa.map(
          (duty: any) => ({
            rate: duty.rate,
            description: duty.description,
            type: duty.type,
            applicableCountries: duty.countries || [],
          })
        );
      }
    }

    // Process Annexes
    if (detailData.annexes) {
      result.annexes = {
        annexI: detailData.annexes.annexI,
        annexII: detailData.annexes.annexII,
        annexIII: detailData.annexes.annexIII,
      };
    }

    // Process Exclusions
    if (detailData.exclusions) {
      result.exclusions = detailData.exclusions.map((exclusion: any) => ({
        description: exclusion.description,
        conditions: exclusion.conditions || [],
        applicableCountries: exclusion.countries || [],
      }));
    }

    // Add any relevant notes
    if (detailData.notes) {
      result.notes = detailData.notes;
    }

    return result;

  } catch (error) {
    console.error("Error fetching HTS data:", error);
    return null;
  }
}

export async function lookupHtsCode(
  query: string,
  importCountry: string
): Promise<{
  mainResult: HtsResult | null;
  alternativeResults?: HtsResult[];
  error?: string;
}> {
  try {
    // Search for the main HTS code
    const mainResult = await searchHts(query);
    if (!mainResult) {
      return {
        mainResult: null,
        error: "No HTS code found matching the query.",
      };
    }

    // Search for alternative classifications
    let alternativeResults: HtsResult[] = [];
    const altSearchResult = await searchHts(query + " alternative");
    if (altSearchResult && altSearchResult.code !== mainResult.code) {
      alternativeResults.push(altSearchResult);
    }

    // Filter duties and tariffs by import country
    if (mainResult && importCountry) {
      // Filter antidumping duties
      if (mainResult.additionalTariffs?.antidumping) {
        mainResult.additionalTariffs.antidumping = mainResult.additionalTariffs.antidumping.filter(
          (duty) => duty.countries.includes(importCountry)
        );
      }

      // Filter countervailing duties
      if (mainResult.additionalTariffs?.countervailing) {
        mainResult.additionalTariffs.countervailing = mainResult.additionalTariffs.countervailing.filter(
          (duty) => duty.countries.includes(importCountry)
        );
      }

      // Filter pentenyl tariffs
      if (mainResult.additionalTariffs?.pentenyl) {
        mainResult.additionalTariffs.pentenyl = mainResult.additionalTariffs.pentenyl.filter(
          (duty) => duty.applicableCountries.includes(importCountry)
        );
      }

      // Filter IEEPA tariffs
      if (mainResult.additionalTariffs?.ieepa) {
        mainResult.additionalTariffs.ieepa = mainResult.additionalTariffs.ieepa.filter(
          (duty) => {
            const applies = duty.applicableCountries.includes(importCountry);
            if (duty.type === 'Brazil' && importCountry !== 'BR') return false;
            if (duty.type === 'RussianOil' && importCountry !== 'RU') return false;
            return applies;
          }
        );
      }

      // Filter exclusions by country
      if (mainResult.exclusions) {
        mainResult.exclusions = mainResult.exclusions.filter(
          (exclusion) => !exclusion.applicableCountries || 
                         exclusion.applicableCountries.length === 0 || 
                         exclusion.applicableCountries.includes(importCountry)
        );
      }
    }

    return {
      mainResult,
      alternativeResults: alternativeResults.length > 0 ? alternativeResults : undefined,
    };

  } catch (error) {
    console.error("Error in HTS lookup:", error);
    return {
      mainResult: null,
      error: "An error occurred while looking up the HTS code.",
    };
  }
}

export default {
  lookupHtsCode,
};
