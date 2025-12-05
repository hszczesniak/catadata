let currentSection = 0;
let currentSubSection = 0;
let catData = null;
let breedColors = {};
let hoveredBreeds = new Set();

function initializeScrollController(data, colors, narratives) {
    currentSection = 0;
    currentSubSection = 0;
    catData = data;
    breedColors = colors;
    window.currentSection = currentSection;
    window.currentSubSection = currentSubSection;
    window.hoveredBreeds = hoveredBreeds;
    
    document.getElementById('storyText').textContent = narratives[currentSubSection];
    
    let scrollTimeout;
    window.addEventListener('scroll', function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            let newSection = 0;
            
            if (scrollPercent > 0.75) {
                newSection = 3;
            } else if (scrollPercent > 0.50) {
                newSection = 2;
            } else if (scrollPercent > 0.25) {
                if (currentSubSection >= 5) {
                    newSection = 1;
                } else {
                    newSection = 0;
                }
            } else {
                newSection = 0;
            }
            
            if (newSection !== currentSection) {
                currentSection = newSection;
                window.currentSection = currentSection;
                
                if (newSection === 0) {
                    currentSubSection = 0;
                    hoveredBreeds.clear();
                } else if (newSection === 1) {
                    currentSubSection = 6;
                } else if (newSection === 2) {
                    if (window.ageChartSubSection !== undefined) {
                        currentSubSection = 7 + window.ageChartSubSection;
                    } else {
                        currentSubSection = 7;
                    }
                } else if (newSection === 3) {
                    currentSubSection = 11;
                }
                
                document.getElementById('storyText').textContent = narratives[currentSubSection];
                handleSectionChange(newSection);
            }
        }, 50);
    });
    
    setupHoverTracking();
}

function setupHoverTracking() {
    const checkInterval = setInterval(() => {
        if (window.scatterPlotState && window.scatterPlotState.chartSvg && window.scatterPlotState.filteredBreedStats) {
            trackBreedHovers();
            clearInterval(checkInterval);
        }
    }, 100);
}

function trackBreedHovers() {
    if (!window.scatterPlotState || !window.scatterPlotState.chartSvg) return;
    
    const breedMeans = window.scatterPlotState.chartSvg.selectAll('.breed-mean');
    
    breedMeans.on('mouseenter.progress', function(event, data) {
        const [breed, stats] = data;
        checkHoverProgress(breed, stats);
    });
    
    const legendItems = document.querySelectorAll('.breed-legend-item');
    legendItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const breed = this.getAttribute('data-breed');
            const stats = window.scatterPlotState.filteredBreedStats.get(breed);
            if (stats) {
                checkHoverProgress(breed, stats);
            }
        });
    });
}

function checkHoverProgress(breed, stats) {
    if (currentSubSection >= 6) return;
    
    const allBreeds = Array.from(window.scatterPlotState.filteredBreedStats.entries());
    
    const rightmost = allBreeds.reduce((max, [b, s]) => 
        s.humanMean > max[1].humanMean ? [b, s] : max
    );
    const leftmost = allBreeds.reduce((min, [b, s]) => 
        s.humanMean < min[1].humanMean ? [b, s] : min
    );
    const topmost = allBreeds.reduce((max, [b, s]) => 
        s.catMean > max[1].catMean ? [b, s] : max
    );
    const bottommost = allBreeds.reduce((min, [b, s]) => 
        s.catMean < min[1].catMean ? [b, s] : min
    );
    
    if (currentSubSection === 0 && breed === rightmost[0]) {
        hoveredBreeds.add('rightmost');
        advanceSubSection();
    } else if (currentSubSection === 1 && breed === leftmost[0]) {
        hoveredBreeds.add('leftmost');
        advanceSubSection();
    } else if (currentSubSection === 2 && breed === 'Russian_Blue') {
        hoveredBreeds.add('russian_blue');
        advanceSubSection();
    } else if (currentSubSection === 3 && breed === topmost[0]) {
        hoveredBreeds.add('topmost');
        advanceSubSection();
    } else if (currentSubSection === 4 && breed === bottommost[0]) {
        hoveredBreeds.add('bottommost');
        advanceSubSection();
    }
}

function advanceSubSection() {
    currentSubSection++;
    window.currentSubSection = currentSubSection;
    
    const narratives = window.narratives;
    if (narratives && narratives[currentSubSection]) {
        const storyText = document.getElementById('storyText');
        if (storyText) {
            storyText.textContent = narratives[currentSubSection];
        }
    }
    
    if (currentSubSection < 5) {
        setTimeout(trackBreedHovers, 100);
    }
}

function handleSectionChange(newSection) {
    if (newSection === 2) {
        const breedLegend = document.getElementById('breedLegend');
        if (breedLegend) {
            breedLegend.style.display = 'none';
            breedLegend.style.visibility = 'hidden';
        }
        if (window.createAgeChart) {
            window.createAgeChart(catData, window.convertToCatYears, window.convertCatYearsToHuman);
        }
    } else if (newSection === 3) {
        const breedLegend = document.getElementById('breedLegend');
        if (breedLegend) {
            breedLegend.style.display = 'none';
            breedLegend.style.visibility = 'hidden';
        }
        if (window.createRecommendationChart && window.filteredBreedStats && window.recommendationMetrics) {
            window.createRecommendationChart(window.filteredBreedStats, window.recommendationMetrics);
        }
    } else {
        const svg = d3.select("#chart").select("svg");
        if (svg.empty() || svg.selectAll(".breed-mean").empty()) {
            d3.select("#chart").selectAll("*").remove();
            const existingAgeLegend = document.querySelector('.age-legend');
            if (existingAgeLegend) {
                existingAgeLegend.remove();
            }
            if (document.getElementById('breedLegend')) {
                document.getElementById('breedLegend').style.display = 'block';
            }
            
            const targetSection = currentSection;
            if (window.createScatterPlot && window.recommendationMetrics) {
                const scatterState = window.createScatterPlot(catData, breedColors, window.recommendationMetrics);
                window.filteredBreedStats = scatterState.filteredBreedStats;
                
                setTimeout(() => {
                    if (window.updateScatterPlot) {
                        window.updateScatterPlot(targetSection);
                    }
                    trackBreedHovers();
                }, 100);
            }
            return;
        }
        
        const breedLegend = document.getElementById('breedLegend');
        if (breedLegend) {
            breedLegend.style.display = 'block';
            breedLegend.style.visibility = 'visible';
        }
        
        if (window.updateScatterPlot) {
            window.updateScatterPlot(currentSection);
        }
    }
}

function getCurrentSection() {
    return currentSection;
}

function getCurrentSubSection() {
    return currentSubSection;
}

function getCatData() {
    return catData;
}

function getBreedColors() {
    return breedColors;
}

window.initializeScrollController = initializeScrollController;
window.getCurrentSection = getCurrentSection;
window.getCurrentSubSection = getCurrentSubSection;
window.getCatData = getCatData;
window.getBreedColors = getBreedColors;
window.advanceSubSection = advanceSubSection;