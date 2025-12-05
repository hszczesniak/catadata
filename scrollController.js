let currentSection = 0;
let catData = null;
let breedColors = {};

function initializeScrollController(data, colors, narratives) {
    currentSection = 0;
    catData = data;
    breedColors = colors;
    
    window.currentSection = currentSection;
    
    document.getElementById('storyText').textContent = narratives[currentSection];
    
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
                newSection = 1;
            } else {
                newSection = 0;
            }

            if (newSection !== currentSection) {
                currentSection = newSection;
                window.currentSection = currentSection;
                document.getElementById('storyText').textContent = narratives[currentSection];

                handleSectionChange(newSection);
            }
        }, 50);
    });
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

function getCatData() {
    return catData;
}

function getBreedColors() {
    return breedColors;
}

window.initializeScrollController = initializeScrollController;
window.getCurrentSection = getCurrentSection;
window.getCatData = getCatData;
window.getBreedColors = getBreedColors;