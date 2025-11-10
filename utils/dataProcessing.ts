import { Ticket } from '../types';
import { getMonthYear, getDayOfWeek, getWeekYear, getDateString, MONTH_NAMES_SHORT } from './dateUtils';

// ==================================
// EXECUTIVE SUMMARY
// ==================================
const calculateKpis = (dataset: Ticket[]) => {
    if (dataset.length === 0) {
        return { totalTickets: 0, percentageClosed: 0, avgResolutionHours: 0, fcrRate: 0, avgReassignments: 0, positiveSentimentRate: 0 };
    }

    const totalTickets = dataset.length;

    const closedTicketsData = dataset.filter(t => 
        t.status?.toLowerCase().includes('closed') || t.status?.toLowerCase().includes('cerrado')
    );
    const closedTicketsCount = closedTicketsData.length;
    const percentageClosed = totalTickets > 0 ? (closedTicketsCount / totalTickets) * 100 : 0;

    const resolutionTimeDiffs = closedTicketsData
        .map(t => {
            const closingTime = t.modification_time;
            const creationTime = t.creation_time;
            if (creationTime instanceof Date && closingTime instanceof Date) {
                return closingTime.getTime() - creationTime.getTime();
            }
            return null;
        })
        .filter((diff): diff is number => diff !== null && diff >= 0);

    const avgResolutionMillis = resolutionTimeDiffs.length > 0
        ? resolutionTimeDiffs.reduce((acc, diff) => acc + diff, 0) / resolutionTimeDiffs.length
        : 0;
    const avgResolutionHours = avgResolutionMillis / (1000 * 60 * 60);

    const fcrTickets = dataset.filter(t => t.is_first_call_resolution === true).length;
    const fcrRate = totalTickets > 0 ? (fcrTickets / totalTickets) * 100 : 0;

    const validReassignments = dataset
        .map(t => t.reassignments)
        .filter((r): r is number => typeof r === 'number' && r >= 0);
    const avgReassignments = validReassignments.length > 0
        ? validReassignments.reduce((acc, r) => acc + r, 0) / validReassignments.length
        : 0;
    
    const sentimentCounts = dataset.reduce((acc, ticket) => {
        const sentiment = ticket.sentiment?.toString().toLowerCase() || 'unknown';
        if (sentiment.includes('positive')) acc.positive++;
        else if (sentiment.includes('negative')) acc.negative++;
        else if (sentiment.includes('neutral')) acc.neutral++;
        return acc;
    }, { positive: 0, negative: 0, neutral: 0 });
    const totalSentiments = sentimentCounts.positive + sentimentCounts.negative + sentimentCounts.neutral;
    const positiveSentimentRate = totalSentiments > 0 ? (sentimentCounts.positive / totalSentiments) * 100 : 0;

    return {
        totalTickets,
        percentageClosed,
        avgResolutionHours,
        fcrRate,
        avgReassignments,
        positiveSentimentRate
    };
};

export const calculateExecutiveSummaryKpis = (data: Ticket[], compareYears: boolean, comparisonYears: { current: number; previous: number } | null) => {
    if (compareYears && comparisonYears) {
        const currentYearData = data.filter(d => d.year === comparisonYears.current);
        const previousYearData = data.filter(d => d.year === comparisonYears.previous);
        return {
            comparisonKpis: {
                current: calculateKpis(currentYearData),
                previous: calculateKpis(previousYearData)
            }
        };
    }
    return { kpis: calculateKpis(data) };
};

// ==================================
// TEMPORAL ANALYSIS
// ==================================
const PREDEFINED_STATUS_ORDER = ['Closed', 'Cerrado FCR', 'In Progress', 'Assigned', 'Pending'];
const STATUS_COLORS: { [key: string]: string } = {
    'Closed': 'bg-green-500',
    'Cerrado FCR': 'bg-emerald-500',
    'In Progress': 'bg-blue-500',
    'Assigned': 'bg-yellow-500',
    'Pending': 'bg-orange-500',
    'Default': 'bg-gray-400',
};
type TimeSeriesPeriod = 'daily' | 'weekly' | 'monthly';

export const calculateTemporalAnalysisData = (data: Ticket[], compareYears: boolean, comparisonYears: { current: number; previous: number } | null) => {
    // For simplicity with async processing, we'll fix the period to monthly for now.
    const timeSeriesPeriod: TimeSeriesPeriod = 'monthly';
    const stackedBarPeriod: TimeSeriesPeriod = 'monthly';

    // Status Order
    const allStatusesInData = Array.from(new Set(data.map(t => t.status).filter(Boolean))) as string[];
    const predefined = PREDEFINED_STATUS_ORDER.filter(s => allStatusesInData.includes(s));
    const remaining = allStatusesInData.filter(s => !PREDEFINED_STATUS_ORDER.includes(s)).sort();
    const statusOrder = [...predefined, ...remaining];

    // Time Series Data (Line Chart)
    const timeSeriesData = (() => {
        if (compareYears && comparisonYears) {
             const dataByMonth: { [month: string]: any } = {};
             MONTH_NAMES_SHORT.forEach(m => {
                 dataByMonth[m] = { created_current: 0, resolved_current: 0, created_previous: 0, resolved_previous: 0 };
             });

             data.forEach(ticket => {
                 if (ticket.creation_time) {
                     const month = getMonthYear(ticket.creation_time).split(' ')[0];
                     if (dataByMonth[month]) {
                        if(ticket.year === comparisonYears.current) dataByMonth[month].created_current++;
                        if(ticket.year === comparisonYears.previous) dataByMonth[month].created_previous++;
                     }
                 }
                 const isClosed = ticket.status?.toLowerCase().includes('closed') || ticket.status?.toLowerCase().includes('cerrado');
                 if (isClosed && ticket.modification_time) {
                    const month = getMonthYear(ticket.modification_time).split(' ')[0];
                    if (dataByMonth[month]) {
                        if(ticket.year === comparisonYears.current) dataByMonth[month].resolved_current++;
                        if(ticket.year === comparisonYears.previous) dataByMonth[month].resolved_previous++;
                    }
                 }
             });

             return MONTH_NAMES_SHORT.map(month => ({ label: month, ...dataByMonth[month] }));
        }

        const dataByPeriod = new Map<string, { created: number; resolved: number }>();
        const getPeriodKey = (date: Date): string => {
            // FIX: Since timeSeriesPeriod is constant, the switch statement contained unreachable code.
            return getMonthYear(date);
        };

        data.forEach(ticket => {
            if (ticket.creation_time) {
                const period = getPeriodKey(ticket.creation_time);
                if (!dataByPeriod.has(period)) dataByPeriod.set(period, { created: 0, resolved: 0 });
                dataByPeriod.get(period)!.created++;
            }
            const isClosed = ticket.status?.toLowerCase().includes('closed') || ticket.status?.toLowerCase().includes('cerrado');
            if (isClosed && ticket.modification_time) {
                const period = getPeriodKey(ticket.modification_time);
                 if (!dataByPeriod.has(period)) dataByPeriod.set(period, { created: 0, resolved: 0 });
                dataByPeriod.get(period)!.resolved++;
            }
        });
        
        const sortedPeriods = Array.from(dataByPeriod.keys()).sort((a, b) => a.localeCompare(b));
        return sortedPeriods.map(period => ({ label: period, ...dataByPeriod.get(period)! }));
    })();
    
    // Stacked Bar Data
    const stackedBarData = (() => {
        if (compareYears && comparisonYears) {
            const dataByMonth: { [month: string]: any } = {};
            MONTH_NAMES_SHORT.forEach(m => {
                dataByMonth[m] = { current: 0, previous: 0 };
            });

            data.forEach(ticket => {
                if (ticket.creation_time) {
                    const month = getMonthYear(ticket.creation_time).split(' ')[0];
                    if (dataByMonth[month]) {
                        if(ticket.year === comparisonYears.current) dataByMonth[month].current++;
                        if(ticket.year === comparisonYears.previous) dataByMonth[month].previous++;
                    }
                }
            });
            return MONTH_NAMES_SHORT.map(month => ({ label: month, values: dataByMonth[month] }));
        }

        const dataByPeriod = new Map<string, { [status: string]: number }>();
        const getPeriodKey = (date: Date): string => {
            // FIX: Since stackedBarPeriod is constant, the switch statement contained unreachable code.
            return getMonthYear(date);
        };

        data.forEach(ticket => {
            if (ticket.creation_time && ticket.status) {
                const period = getPeriodKey(ticket.creation_time);
                if (!dataByPeriod.has(period)) dataByPeriod.set(period, {});
                const periodStats = dataByPeriod.get(period)!;
                periodStats[ticket.status] = (periodStats[ticket.status] || 0) + 1;
            }
        });
        
        const sortedPeriods = Array.from(dataByPeriod.keys()).sort((a, b) => a.localeCompare(b));
        return sortedPeriods.map(period => ({ label: period, values: dataByPeriod.get(period)! }));
    })();

    // Heatmap Data
    const heatmapData = (() => {
        const createMatrix = (dataset: Ticket[]) => {
            const counts: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
            dataset.forEach(ticket => {
                if (ticket.creation_time) {
                    let day = ticket.creation_time.getDay();
                    day = (day === 0) ? 6 : day - 1;
                    const hour = ticket.creation_time.getHours();
                    counts[day][hour]++;
                }
            });
            return counts;
        };

        if (compareYears && comparisonYears) {
            const currentYearData = data.filter(d => d.year === comparisonYears.current);
            const previousYearData = data.filter(d => d.year === comparisonYears.previous);
            return {
                current: createMatrix(currentYearData),
                previous: createMatrix(previousYearData)
            };
        }
        
        return { current: createMatrix(data), previous: null };
    })();

    // FIX: Corrected typo from `statusColors` to `STATUS_COLORS` to match the defined constant.
    return { timeSeriesData, stackedBarData, heatmapData, statusOrder, statusColors: STATUS_COLORS };
};

// ==================================
// CLASSIFICATION ANALYSIS
// ==================================

const createTreemapData = (dataset: Ticket[]) => {
    const root: { name: string; children: any[] } = { name: 'root', children: [] };
    const categoryMap = new Map<string, any>();
    dataset.forEach(ticket => {
        const categoryName = ticket.category || 'Sin Categoría';
        const subCategoryName = ticket.sub_category || 'Sin Subcategoría';
        if (!categoryMap.has(categoryName)) {
            const newCategoryNode = { name: categoryName, children: [] };
            categoryMap.set(categoryName, newCategoryNode);
            root.children.push(newCategoryNode);
        }
        const categoryNode = categoryMap.get(categoryName);
        let subCategoryNode = categoryNode.children.find((c: any) => c.name === subCategoryName);
        if (!subCategoryNode) {
            subCategoryNode = { name: subCategoryName, value: 0 };
            categoryNode.children.push(subCategoryNode);
        }
        subCategoryNode.value++;
    });
    root.children.forEach(categoryNode => {
        categoryNode.value = categoryNode.children.reduce((sum: number, child: any) => sum + child.value, 0);
    });
    root.children.sort((a, b) => b.value - a.value);
    return root;
};

export const calculateClassificationData = (data: Ticket[], compareYears: boolean, comparisonYears: { current: number; previous: number } | null) => {
    const treemapData = (() => {
        if (compareYears && comparisonYears) {
            const currentYearData = data.filter(d => d.year === comparisonYears.current);
            const previousYearData = data.filter(d => d.year === comparisonYears.previous);
            return {
                current: createTreemapData(currentYearData),
                previous: createTreemapData(previousYearData)
            }
        }
        return { current: createTreemapData(data), previous: null };
    })();

    const topCategoriesData = (() => {
        const getTop10 = (dataset: Ticket[]) => {
            const counts: { [key: string]: number } = {};
            dataset.forEach(ticket => {
                if (ticket.category) counts[ticket.category] = (counts[ticket.category] || 0) + 1;
            });
            return Object.entries(counts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);
        };

        if (compareYears && comparisonYears) {
            const currentData = data.filter(d => d.year === comparisonYears.current);
            const previousData = data.filter(d => d.year === comparisonYears.previous);
            
            const currentCounts: { [key: string]: number } = {};
            currentData.forEach(t => { if(t.category) currentCounts[t.category] = (currentCounts[t.category] || 0) + 1});
            
            const previousCounts: { [key: string]: number } = {};
            previousData.forEach(t => { if(t.category) previousCounts[t.category] = (previousCounts[t.category] || 0) + 1});

            const top10Current = getTop10(currentData).map(d => d.name);
            const top10Previous = getTop10(previousData).map(d => d.name);
            const combinedCategories = Array.from(new Set([...top10Current, ...top10Previous]));
            
            return combinedCategories.map(name => ({
                name,
                currentValue: currentCounts[name] || 0,
                previousValue: previousCounts[name] || 0,
            })).sort((a, b) => b.currentValue - a.currentValue);
        }

        return getTop10(data);
    })();

    const crosstabData = (() => {
        const dataset = (compareYears && comparisonYears) ? data.filter(d => d.year === comparisonYears.current) : data;

        const matrix: { [cat: string]: { [status: string]: number } } = {};
        const categories = new Set<string>();
        const statuses = new Set<string>();

        dataset.forEach(ticket => {
            if (ticket.category && ticket.status) {
                categories.add(ticket.category);
                statuses.add(ticket.status);
                if (!matrix[ticket.category]) matrix[ticket.category] = {};
                matrix[ticket.category][ticket.status] = (matrix[ticket.category][ticket.status] || 0) + 1;
            }
        });
        
        const topCategoriesNames = Array.isArray(topCategoriesData) && topCategoriesData[0] && 'currentValue' in topCategoriesData[0] 
            ? (topCategoriesData as {name: string}[]).map(c => c.name) 
            : (topCategoriesData as {name: string, value: number}[]).map(c => c.name);

        const sortedCategories = Array.from(categories).filter(c => topCategoriesNames.includes(c)).sort();
        const sortedStatuses = Array.from(statuses).sort((a, b) => {
            const indexA = PREDEFINED_STATUS_ORDER.indexOf(a);
            const indexB = PREDEFINED_STATUS_ORDER.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        return { rows: sortedCategories, columns: sortedStatuses, data: matrix };
    })();
    
    return { treemapData, topCategoriesData, crosstabData };
};

// ==================================
// OPERATIONAL EFFICIENCY
// ==================================
interface AgentPerformanceData {
    agentName: string;
    ticketCount: number;
    avgResolutionHours: number;
    slaMet: number;
    slaMissed: number;
    slaRate: number;
}

const processAgentDataset = (dataset: Ticket[]): AgentPerformanceData[] => {
    const agentData: { [key: string]: { tickets: Ticket[] } } = {};

    dataset.forEach(ticket => {
        const agentName = ticket.ultimo_agente || 'Sin Asignar';
        if (!agentData[agentName]) {
            agentData[agentName] = { tickets: [] };
        }
        agentData[agentName].tickets.push(ticket);
    });

    return Object.entries(agentData).map(([agentName, data]) => {
        const ticketCount = data.tickets.length;
        
        const closedTickets = data.tickets.filter(t => t.status?.toLowerCase().includes('closed') || t.status?.toLowerCase().includes('cerrado'));
        const resolutionTimes = closedTickets
            .map(t => (t.modification_time && t.creation_time) ? t.modification_time.getTime() - t.creation_time.getTime() : null)
            .filter((t): t is number => t !== null && t >= 0);

        const avgResolutionMillis = resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0;
        const avgResolutionHours = avgResolutionMillis / (1000 * 60 * 60);

        const slaMissed = data.tickets.filter(t => t.vencido?.toLowerCase() === 'vencido').length;
        const slaMet = ticketCount - slaMissed;
        const slaRate = ticketCount > 0 ? (slaMet / ticketCount) * 100 : 100;

        return { agentName, ticketCount, avgResolutionHours, slaMet, slaMissed, slaRate };
    }).sort((a,b) => b.ticketCount - a.ticketCount);
};


export const calculateOperationalEfficiencyData = (data: Ticket[], compareYears: boolean, comparisonYears: { current: number; previous: number } | null) => {
    const overallStats = (() => {
        const calculateStats = (dataset: Ticket[]) => {
            if (dataset.length === 0) return { slaMet: 0, slaMissed: 0, slaRate: 0, avgResolution: 0 };
            
            const slaMissed = dataset.filter(t => t.vencido?.toLowerCase() === 'vencido').length;
            const slaMet = dataset.length - slaMissed;
            const slaRate = (slaMet / dataset.length) * 100;

            const closedTickets = dataset.filter(t => t.status?.toLowerCase().includes('closed') || t.status?.toLowerCase().includes('cerrado'));
            const resolutionTimes = closedTickets
                .map(t => (t.modification_time && t.creation_time) ? t.modification_time.getTime() - t.creation_time.getTime() : null)
                .filter((t): t is number => t !== null && t >= 0);
            
            const avgResolutionMillis = resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0;
            const avgResolution = avgResolutionMillis / (1000 * 60 * 60);

            return { slaMet, slaMissed, slaRate, avgResolution };
        }
        
        if (compareYears && comparisonYears) {
             return {
                current: calculateStats(data.filter(d => d.year === comparisonYears.current)),
                previous: calculateStats(data.filter(d => d.year === comparisonYears.previous)),
             }
        }
        return { current: calculateStats(data), previous: null };
    })();
    
    const agentPerformanceData = (() => {
        if (compareYears && comparisonYears) {
            const currentData = processAgentDataset(data.filter(d => d.year === comparisonYears.current));
            const previousData = processAgentDataset(data.filter(d => d.year === comparisonYears.previous));
            
            const combined: { [key: string]: { current: AgentPerformanceData | null, previous: AgentPerformanceData | null } } = {};

            currentData.forEach(agent => {
                if(!combined[agent.agentName]) combined[agent.agentName] = { current: null, previous: null };
                combined[agent.agentName].current = agent;
            });
            previousData.forEach(agent => {
                if(!combined[agent.agentName]) combined[agent.agentName] = { current: null, previous: null };
                combined[agent.agentName].previous = agent;
            });
            
            return Object.entries(combined).map(([agentName, data]) => ({ agentName, ...data }))
                .sort((a, b) => (b.current?.ticketCount || 0) - (a.current?.ticketCount || 0));
        }
        return processAgentDataset(data);
    })();

    const barChartData = (() => {
        // FIX: Use a type guard ('in' operator) to correctly narrow the union type of agentPerformanceData.
        if (compareYears && agentPerformanceData.length > 0 && 'current' in agentPerformanceData[0]) {
             return (agentPerformanceData as {agentName: string, current: AgentPerformanceData | null, previous: AgentPerformanceData | null}[])
                .map(d => ({
                    name: d.agentName,
                    currentValue: d.current?.ticketCount || 0,
                    previousValue: d.previous?.ticketCount || 0
                }))
                .slice(0, 15);
        }
        return (agentPerformanceData as AgentPerformanceData[])
            .map(d => ({ name: d.agentName, value: d.ticketCount }))
            .slice(0, 15);
    })();
    
    const scatterPlotData = (() => {
        // FIX: Use a type guard ('in' operator) to correctly narrow the union type of agentPerformanceData.
        const dataset = (compareYears && agentPerformanceData.length > 0 && 'current' in agentPerformanceData[0])
            ? (agentPerformanceData as {agentName: string, current: AgentPerformanceData | null}[]).map(d => d.current).filter(Boolean) as AgentPerformanceData[]
            : agentPerformanceData as AgentPerformanceData[];
        
        return dataset.map(agent => ({
            x: agent.ticketCount,
            y: agent.avgResolutionHours,
            label: agent.agentName
        }));
    })();
    
    return { overallStats, agentPerformanceData, barChartData, scatterPlotData };
}


// ==================================
// TEXT ANALYSIS - ASUNTO
// ==================================
const STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un',
  'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus',
  'le', 'ya', 'o', 'este', 'ha', 'me', 'si', 'porque', 'esta', 'cuando',
  'muy', 'sin', 'sobre', 'también', 'mi', 'hasta', 'hay', 'donde', 'quien',
  'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra',
  'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes',
  'algunos', 'qué', 'entre', 'ser', 'es', 'está', 'están', 'soy', 'eres',
  'somos', 'son', 'fue', 'fui', 'fuimos', 'fueron', 'sea', 'sean', 'sido',
  'saber', 'solicito', 'ayuda', 'soporte', 'requiero', 'necesito', 'ticket',
  'caso', 'plataforma', 'aula', 'virtual'
]);

const generateBigrams = (text: string): string[] => {
    if (!text || typeof text !== 'string') return [];
    const words = text
        .toLowerCase()
        .replace(/[.,:;!?¿¡"()]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOPWORDS.has(word) && isNaN(Number(word)));
    
    if (words.length < 2) return [];
    
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
    return bigrams;
};


export const calculateTextAnalysisAsuntoData = (data: Ticket[]) => {
    // 1. Calculate Bigram Frequencies
    const bigramCounts: { [key: string]: number } = {};
    data.forEach(ticket => {
        const asunto = ticket['asunto'] || '';
        const bigrams = generateBigrams(asunto);
        bigrams.forEach(bigram => {
            bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
        });
    });

    // 2. Get Top 10 Expressions
    const topExpressions = Object.entries(bigramCounts)
        .map(([text, value]) => ({ name: text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    
    const top5ExpressionTexts = topExpressions.slice(0, 5).map(e => e.name);

    // 3. Calculate Monthly Trends for Top 5 Expressions
    const monthlyTrends: { [month: string]: { [expression: string]: number } } = {};
    data.forEach(ticket => {
        const asunto = (ticket['asunto'] || '').toLowerCase();
        if (asunto && ticket.creation_time) {
            const monthYear = getMonthYear(ticket.creation_time);
            if (!monthlyTrends[monthYear]) {
                monthlyTrends[monthYear] = {};
            }
            top5ExpressionTexts.forEach(expression => {
                if (asunto.includes(expression)) {
                    monthlyTrends[monthYear][expression] = (monthlyTrends[monthYear][expression] || 0) + 1;
                }
            });
        }
    });
    
    const sortedMonths = Object.keys(monthlyTrends).sort((a, b) => {
        const [m1, y1] = a.split(' ');
        const [m2, y2] = b.split(' ');
        if (y1 !== y2) return parseInt(y1) - parseInt(y2);
        return MONTH_NAMES_SHORT.indexOf(m1) - MONTH_NAMES_SHORT.indexOf(m2);
    });

    const expressionTrends = sortedMonths.map(month => {
        const trendData: { [key: string]: any } = { month };
        top5ExpressionTexts.forEach(expression => {
            trendData[expression] = monthlyTrends[month][expression] || 0;
        });
        return trendData;
    });

    // 4. Get Examples for Top Expressions
    const expressionExamples: { [key: string]: { count: number; examples: string[] } } = {};
    topExpressions.forEach(expr => {
        const matchingTickets = data
            .filter(ticket => (ticket['asunto'] || '').toLowerCase().includes(expr.name))
            .slice(0, 3)
            .map(ticket => ticket['asunto'] as string);
        
        expressionExamples[expr.name] = {
            count: expr.value,
            examples: matchingTickets
        };
    });

    const sortedExpressionExamples = Object.entries(expressionExamples)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

    return { topExpressions, expressionTrends, expressionExamples: sortedExpressionExamples, top5ExpressionTexts };
};