if (!window.recommendationPrefs) {
    window.recommendationPrefs = {
        rank1: null,
        rank2: null,
        rank3: null
    };
}

function createRecommendationChart(filteredBreedStats, recommendationMetrics) {
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
        .style("margin-bottom", "0px")
        .style("font-size", "28px")
        .style("color", "#333")
        .text("Find Your Perfect Match");

    const selectorContainer = container.append("div")
        .attr("id", "recommendation-selector")
        .style("margin-bottom", "40px")
        .style("background", "#f9f9f9")
        .style("padding", "30px")
        .style("border-radius", "8px")
        .style("max-width", "600px");

    selectorContainer.append("p")
        .style("margin-bottom", "20px")
        .style("font-size", "16px")
        .style("color", "#666");

    const ranks = [
        { rank: 1, label: "Most Important", weight: 0.5 },
        { rank: 2, label: "Moderately Important", weight: 0.3 },
        { rank: 3, label: "Kind Of Important", weight: 0.2 }
    ];

    ranks.forEach(({ rank, label, weight }) => {
        const row = selectorContainer.append("div")
            .style("margin-bottom", "30px")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "10px");

        const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd';

        row.append("label")
            .style("font-weight", "bold")
            .style("min-width", "120px")
            .text(`${rank}${suffix} Choice (${label}):`);

        const select = row.append("select")
            .attr("id", `pref-${rank}`)
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("border", "1px solid #ccc")
            .style("font-size", "14px");

        select.append("option")
            .attr("value", "")
            .text("-- Select --");

        recommendationMetrics.forEach(m => {
            select.append("option")
                .attr("value", m.key)
                .text(m.label);
        });

        select.on("change", function () {
            console.log(`Dropdown ${rank} changed to:`, this.value);
            window.recommendationPrefs[`rank${rank}`] = this.value;
            updatePodium(filteredBreedStats, recommendationMetrics);
        });
    });

    const podiumContainer = container.append("div")
        .attr("id", "podium-container")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "flex-end")
        .style("gap", "50px")
        .style("margin-top", "50px")
        .style("height", "200px");

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

function updatePodium(filteredBreedStats, recommendationMetrics) {
    console.log('=== updatePodium called ===');

    const rank1 = window.recommendationPrefs.rank1;
    const rank2 = window.recommendationPrefs.rank2;
    const rank3 = window.recommendationPrefs.rank3;

    console.log('Preferences:', { rank1, rank2, rank3 });

    d3.selectAll(".podium-position").selectAll("*").remove();

    if (!rank1 || !rank2 || !rank3) {
        console.log('Not all preferences selected');
        return;
    }

    if (rank1 === rank2 || rank1 === rank3 || rank2 === rank3) {
        console.log('Duplicate selections');
        return;
    }

    const breedScores = calculateBreedScores(rank1, rank2, rank3, filteredBreedStats);
    console.log('Breed scores:', breedScores.length);

    if (!breedScores || breedScores.length === 0) {
        return;
    }

    const top3 = breedScores.slice(0, 3);
    console.log('Top 3:', top3);

    const positions = [
        { rank: 1, suffix: 'st' },
        { rank: 2, suffix: 'nd' },
        { rank: 3, suffix: 'rd' }
    ];
    const positionMap = { 0: 1, 1: 2, 2: 3 };
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const heights = [220, 170, 120];

    top3.forEach((breedData, idx) => {
        const pos = positionMap[idx];
        const position = d3.select(`#podium-${pos}`);
        const posInfo = positions[pos - 1];

        console.log(`Rendering position ${pos}:`, breedData.breed);

        const label = position.append("div")
            .style("margin-bottom", "15px")
            .style("text-align", "center")
            .style("width", "250px");

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
            .style("height", heights[idx] + "px")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("border-radius", "8px 8px 0 0")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

        console.log(`${posInfo.rank} Rendering position ${posInfo.suffix}:`, breedData.breed);

        block.append("div")
            .style("font-size", "36px")
            .style("font-weight", "bold")
            .style("color", "#333")
            .text(posInfo.rank + posInfo.suffix);
    });

    console.log('=== Podium complete ===');
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