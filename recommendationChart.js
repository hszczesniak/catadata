if (!window.recommendationPrefs) {
    window.recommendationPrefs = {
        rank1: null,
        rank2: null,
        rank3: null
    };
}

let recommendationStep = 0;

function createRecommendationChart(filteredBreedStats, recommendationMetrics) {
    recommendationStep = 0;
    window.recommendationPrefs = { rank1: null, rank2: null, rank3: null };
    
    const breedLegendAlt = document.querySelector('.breed-legend');
    if (breedLegendAlt) {
        breedLegendAlt.style.display = 'none';
        breedLegendAlt.style.visibility = 'hidden';
    }

    d3.select("#chart").selectAll("*").remove();

    const container = d3.select("#chart")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("padding", "40px 20px")
        .style("text-align", "center");

    container.append("h2")
        .style("margin-bottom", "20px")
        .style("font-size", "28px")
        .style("color", "#333")
        .text("Find Your Perfect Match");

    const instructionText = container.append("p")
        .attr("id", "recommendation-instruction")
        .style("margin-bottom", "30px")
        .style("font-size", "18px")
        .style("color", "#555")
        .style("max-width", "600px")
        .text("Let's find the best cat breed for you! First, what's the MOST important trait you're looking for in a cat?");

    const selectorContainer = container.append("div")
        .attr("id", "recommendation-selector")
        .style("margin-bottom", "40px")
        .style("background", "#f9f9f9")
        .style("padding", "30px")
        .style("border-radius", "8px")
        .style("max-width", "600px");

    const ranks = [
        { rank: 1, label: "Most Important", weight: 0.5 },
        { rank: 2, label: "Moderately Important", weight: 0.3 },
        { rank: 3, label: "Kind Of Important", weight: 0.2 }
    ];

    ranks.forEach(({ rank, label, weight }) => {
        const row = selectorContainer.append("div")
            .attr("id", `selector-row-${rank}`)
            .style("margin-bottom", "30px")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "10px")
            .style("opacity", rank === 1 ? "1" : "0.3")
            .style("pointer-events", rank === 1 ? "all" : "none");

        const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd';

        row.append("label")
            .style("font-weight", "bold")
            .style("min-width", "180px")
            .style("text-align", "right")
            .text(`${rank}${suffix} Choice:`);

        const select = row.append("select")
            .attr("id", `pref-${rank}`)
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("border", "1px solid #ccc")
            .style("font-size", "14px")
            .style("min-width", "300px");

        select.append("option")
            .attr("value", "")
            .text("-- Select a trait --");

        recommendationMetrics.forEach(m => {
            select.append("option")
                .attr("value", m.key)
                .text(m.label);
        });

        select.on("change", function () {
            const selectedValue = this.value;
            
            window.recommendationPrefs[`rank${rank}`] = selectedValue || null;
            
            if (selectedValue) {
                advanceRecommendationStep(rank, filteredBreedStats, recommendationMetrics);
            }
            
            updateAllDropdownFilters();
        });
    });

    const podiumContainer = container.append("div")
        .attr("id", "podium-container")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "flex-end")
        .style("gap", "50px")
        .style("margin-top", "50px")
        .style("height", "200px")
        .style("opacity", "0");

    [2, 1, 3].forEach((position, idx) => {
        podiumContainer.append("div")
            .attr("id", `podium-${position}`)
            .attr("class", "podium-position")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("justify-content", "flex-end");
    });
}

function advanceRecommendationStep(completedRank, filteredBreedStats, recommendationMetrics) {
    recommendationStep = Math.max(recommendationStep, completedRank);
    
    const instructions = [
        "",
        "Great choice! Now, what's your second most important trait?",
        "Perfect! Finally, what's your third priority?",
        "Excellent! Here are your top 3 breed matches based on your preferences. Feel free to change any selection above to explore different matches!"
    ];
    
    const instructionText = d3.select("#recommendation-instruction");
    if (instructionText && instructions[recommendationStep]) {
        instructionText.text(instructions[recommendationStep]);
    }
    
    if (recommendationStep >= 1) {
        d3.select("#selector-row-2")
            .style("opacity", "1")
            .style("pointer-events", "all");
        filterAvailableOptions(2);
    }
    
    if (recommendationStep >= 2) {
        d3.select("#selector-row-3")
            .style("opacity", "1")
            .style("pointer-events", "all");
        filterAvailableOptions(3);
    }
    
    if (recommendationStep >= 3 && window.recommendationPrefs.rank1 && window.recommendationPrefs.rank2 && window.recommendationPrefs.rank3) {
        d3.select("#podium-container")
            .transition()
            .duration(500)
            .style("opacity", "1");
        updatePodium(filteredBreedStats, recommendationMetrics);
    }
}

function filterAvailableOptions(currentRank) {
    const select = d3.select(`#pref-${currentRank}`).node();
    if (!select) return;
    
    const otherRanks = [1, 2, 3].filter(r => r !== currentRank);
    const selectedValues = otherRanks
        .map(r => window.recommendationPrefs[`rank${r}`])
        .filter(v => v);
    
    Array.from(select.options).forEach(option => {
        if (option.value && selectedValues.includes(option.value)) {
            option.disabled = true;
            option.style.color = '#ccc';
        } else {
            option.disabled = false;
            option.style.color = '';
        }
    });
}

function updateAllDropdownFilters() {
    filterAvailableOptions(1);
    filterAvailableOptions(2);
    filterAvailableOptions(3);
}

function updatePodium(filteredBreedStats, recommendationMetrics) {
    const rank1 = window.recommendationPrefs.rank1;
    const rank2 = window.recommendationPrefs.rank2;
    const rank3 = window.recommendationPrefs.rank3;

    d3.selectAll(".podium-position").selectAll("*").remove();

    if (!rank1 || !rank2 || !rank3) {
        return;
    }

    if (rank1 === rank2 || rank1 === rank3 || rank2 === rank3) {
        return;
    }

    const breedScores = calculateBreedScores(rank1, rank2, rank3, filteredBreedStats);

    if (!breedScores || breedScores.length === 0) {
        return;
    }

    const top3 = breedScores.slice(0, 3);

    const positions = [
        { rank: 1, suffix: 'st' },
        { rank: 2, suffix: 'nd' },
        { rank: 3, suffix: 'rd' }
    ];
    const positionMap = { 0: 1, 1: 2, 2: 3 };
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const heights = [220, 170, 120];
    
    const isFirstRender = d3.select("#podium-container").style("opacity") === "0";

    top3.forEach((breedData, idx) => {
        const pos = positionMap[idx];
        const position = d3.select(`#podium-${pos}`);
        const posInfo = positions[pos - 1];

        const label = position.append("div")
            .style("margin-bottom", "15px")
            .style("text-align", "center")
            .style("width", "250px")
            .style("opacity", isFirstRender ? "0" : "1");
        
        if (isFirstRender) {
            label.transition()
                .duration(400)
                .delay(800 + idx * 200)
                .style("opacity", "1");
        }

        label.append("div")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .style("color", "#333")
            .style("margin-bottom", "8px")
            .style("line-height", "1.2")
            .text(breedData.breed.replace(/_/g, " "));

        label.append("div")
            .style("font-size", "13px")
            .style("color", "#555")
            .style("font-weight", "600")
            .style("margin-bottom", "6px")
            .text(`Overall: ${(breedData.score * 100).toFixed(0)}%`);

        const metrics = [rank1, rank2, rank3];
        const metricLabels = [
            recommendationMetrics.find(m => m.key === rank1)?.label,
            recommendationMetrics.find(m => m.key === rank2)?.label,
            recommendationMetrics.find(m => m.key === rank3)?.label
        ];

        metrics.forEach((metric, i) => {
            if (breedData.metricScores[metric] !== undefined) {
                label.append("div")
                    .style("font-size", "11px")
                    .style("color", "#777")
                    .style("margin-top", "2px")
                    .style("line-height", "1.3")
                    .text(`${metricLabels[i]}: ${(breedData.metricScores[metric] * 100).toFixed(0)}%`);
            }
        });

        const block = position.append("div")
            .style("background", colors[idx])
            .style("width", "190px")
            .style("height", isFirstRender ? "0px" : heights[idx] + "px")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("border-radius", "8px 8px 0 0")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
            .style("overflow", "hidden");

        if (isFirstRender) {
            block.transition()
                .duration(800)
                .delay(idx * 200)
                .style("height", heights[idx] + "px");
        }

        const rankLabel = block.append("div")
            .style("font-size", "36px")
            .style("font-weight", "bold")
            .style("color", "#333")
            .style("opacity", isFirstRender ? "0" : "1")
            .text(posInfo.rank + posInfo.suffix);

        if (isFirstRender) {
            rankLabel.transition()
                .duration(400)
                .delay(800 + idx * 200)
                .style("opacity", "1");
        }
    });
}

function calculateBreedScores(metric1, metric2, metric3, filteredBreedStats) {
    const weights = [0.5, 0.3, 0.2];
    const metrics = [metric1, metric2, metric3];

    const scores = new Map();

    filteredBreedStats.forEach((stats, breed) => {
        let score = 0;
        let validMetricsCount = 0;
        const metricScores = {};

        metrics.forEach((metric, idx) => {
            const breedCats = stats.cats;
            let value = null;

            if (breedCats && breedCats.length > 0) {
                const metricValues = breedCats
                    .map(cat => cat[metric])
                    .filter(v => v !== undefined && v !== null && !isNaN(v));

                if (metricValues.length > 0) {
                    value = d3.mean(metricValues);
                }
            }

            if (value !== null) {
                validMetricsCount++;
                let normalized = (value - 1) / 4;
                metricScores[metric] = normalized;
                score += normalized * weights[idx];
            }
        });

        if (validMetricsCount > 0) {
            scores.set(breed, { score, metricScores });
        }
    });

    return Array.from(scores.entries())
        .map(([breed, data]) => ({ breed, score: data.score, metricScores: data.metricScores }))
        .sort((a, b) => b.score - a.score);
}

window.createRecommendationChart = createRecommendationChart;