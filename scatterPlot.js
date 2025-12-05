if (!window.scatterPlotState) {
    window.scatterPlotState = {
        chartSvg: null,
        xScale: null,
        yScale: null,
        breedGroups: null,
        filteredBreedStats: null,
        chartWidth: null,
        chartHeight: null,
        xAxis: null,
        yAxis: null,
        xGridLines: null,
        yGridLines: null
    };
}

function createBreedLegend(filteredBreedStats, breedColors, toggleBreedVisibility) {
    let legendDiv = document.getElementById('breedLegend');
    if (!legendDiv) {
        legendDiv = document.createElement('div');
        legendDiv.className = 'breed-legend';
        legendDiv.id = 'breedLegend';
        legendDiv.innerHTML = '<div class="breed-legend-title">Breed</div>';

        Array.from(filteredBreedStats.keys()).sort().forEach(breed => {
            const color = breedColors[breed];
            const displayBreed = breed.replace(/_/g, ' ');
            const item = document.createElement('div');
            item.className = 'breed-legend-item';
            item.setAttribute('data-breed', breed);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.className = 'breed-checkbox';
            checkbox.setAttribute('data-breed', breed);
            checkbox.addEventListener('change', function () {
                toggleBreedVisibility(breed, this.checked);
            });

            const colorDiv = document.createElement('div');
            colorDiv.className = 'breed-legend-color';
            colorDiv.style.background = color;

            const label = document.createElement('span');
            label.textContent = displayBreed;

            item.appendChild(checkbox);
            item.appendChild(colorDiv);
            item.appendChild(label);

            const stats = filteredBreedStats.get(breed);

            function updateItemState() {
                if (checkbox.checked) {
                    item.classList.remove('disabled');
                } else {
                    item.classList.add('disabled');
                }
            }

            updateItemState();
            checkbox.addEventListener('change', updateItemState);

            item.addEventListener('mouseenter', function (event) {
                if (!checkbox.checked || !stats) return;

                const breedGroup = window.scatterPlotState.chartSvg.selectAll(`.breed-group[data-breed="${breed}"]`);
                if (breedGroup.empty()) return;

                breedGroup.each(function () {
                    this.parentNode.appendChild(this);

                    const labelLayer = window.scatterPlotState.chartSvg.select(".label-layer").node();
                    if (labelLayer) {
                        labelLayer.parentNode.appendChild(labelLayer);
                    }
                });

                const currentSection = window.currentSection || 0;
                if (currentSection === 1) {
                    breedGroup.selectAll(".individual-dot").classed("active", true);
                }
                breedGroup.selectAll(".breed-mean")
                    .classed("active", true)
                    .attr("r", function () {
                        const baseSize = currentSection === 0 ? 5 : 3;
                        return baseSize * 1.5;
                    });
                window.scatterPlotState.chartSvg.selectAll(`.breed-label-text[data-breed="${breed}"]`).classed("active", true);

                const tooltip = d3.select("#tooltip");
                const showDeviation = currentSection === 1;
                const humanText = showDeviation
                    ? `Human Sociability: ${stats.humanMean.toFixed(2)} (±${stats.humanStd.toFixed(2)})`
                    : `Human Sociability: ${stats.humanMean.toFixed(2)}`;
                const catText = showDeviation
                    ? `Cat Sociability: ${stats.catMean.toFixed(2)} (±${stats.catStd.toFixed(2)})`
                    : `Cat Sociability: ${stats.catMean.toFixed(2)}`;
                tooltip.classed("visible", true)
                    .html(`
                        <strong>${displayBreed}</strong><br/>
                        ${humanText}<br/>
                        ${catText}<br/>
                        Sample: ${stats.count} cats
                    `);
            });

            item.addEventListener('mousemove', function (event) {
                if (!checkbox.checked) return;

                const tooltip = d3.select("#tooltip");
                const chartDiv = document.getElementById('chart');
                const chartDivRect = chartDiv.getBoundingClientRect();
                tooltip
                    .style("left", (chartDivRect.left + 70) + "px")
                    .style("top", (chartDivRect.top + 50) + "px");
            });

            item.addEventListener('mouseleave', function () {
                const currentSection = window.currentSection || 0;
                const breedGroup = window.scatterPlotState.chartSvg.selectAll(`.breed-group[data-breed="${breed}"]`);
                breedGroup.selectAll(".breed-mean")
                    .classed("active", false)
                    .attr("r", function () {
                        return currentSection === 0 ? 5 : 3;
                    });
                breedGroup.selectAll(".individual-dot").classed("active", false);
                window.scatterPlotState.chartSvg.selectAll(`.breed-label-text[data-breed="${breed}"]`).classed("active", false);

                const tooltip = d3.select("#tooltip");
                tooltip.classed("visible", false);
            });

            legendDiv.appendChild(item);
        });

        document.querySelector('.fixed-container').appendChild(legendDiv);
    }
    legendDiv = document.getElementById('breedLegend');
    if (legendDiv) {
        legendDiv.style.display = 'block';
        legendDiv.style.visibility = 'visible';
    }
}

function createScatterPlot(catData, breedColors, recommendationMetrics) {
    const breedStats = d3.rollup(
        catData,
        v => {
            const stats = {
                humanMean: d3.mean(v, d => d.human_sociability),
                catMean: d3.mean(v, d => d.cat_sociability),
                humanStd: d3.deviation(v, d => d.human_sociability) || 0,
                catStd: d3.deviation(v, d => d.cat_sociability) || 0,
                count: v.length,
                cats: v
            };
            
            recommendationMetrics.forEach(metric => {
                stats[`${metric.key}Mean`] = d3.mean(v, d => d[metric.key]);
            });
            
            return stats;
        },
        d => d.breed
    );

    window.scatterPlotState.filteredBreedStats = new Map(
        Array.from(breedStats.entries()).filter(([breed, stats]) =>
            stats.count >= 50 && breed !== 'Other' && breed !== 'OTHER'
        )
    );

    createBreedLegend(window.scatterPlotState.filteredBreedStats, breedColors, toggleBreedVisibility);
    
    const margin = { top: 30, right: 60, bottom: 60, left: 60 };
    window.scatterPlotState.chartWidth = 600 - margin.left - margin.right;
    window.scatterPlotState.chartHeight = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", window.scatterPlotState.chartWidth + margin.left + margin.right)
        .attr("height", window.scatterPlotState.chartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    window.scatterPlotState.chartSvg = svg;

    window.scatterPlotState.xScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, window.scatterPlotState.chartWidth]);

    window.scatterPlotState.yScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([window.scatterPlotState.chartHeight, 0]);

    window.scatterPlotState.xGridLines = svg.append("g").attr("class", "grid");
    window.scatterPlotState.yGridLines = svg.append("g").attr("class", "grid");

    updateGrid();

    window.scatterPlotState.xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${window.scatterPlotState.chartHeight})`);

    window.scatterPlotState.yAxis = svg.append("g")
        .attr("class", "y-axis");

    updateAxes();

    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", window.scatterPlotState.chartWidth / 2)
        .attr("y", window.scatterPlotState.chartHeight + 45)
        .attr("text-anchor", "middle")
        .text("Human Sociability Score");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -window.scatterPlotState.chartHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Cat Sociability Score");

    const tooltip = d3.select("#tooltip");

    window.scatterPlotState.breedGroups = svg.selectAll(".breed-group")
        .data(Array.from(window.scatterPlotState.filteredBreedStats.entries()))
        .enter()
        .append("g")
        .attr("class", "breed-group")
        .attr("data-breed", ([breed]) => breed);

    window.scatterPlotState.breedGroups.each(function ([breed, stats]) {
        const group = d3.select(this);
        const color = breedColors[breed];

        group.selectAll(".individual-dot")
            .data(stats.cats)
            .enter()
            .append("circle")
            .attr("class", "individual-dot")
            .attr("cx", d => window.scatterPlotState.xScale(d.human_sociability))
            .attr("cy", d => window.scatterPlotState.yScale(d.cat_sociability))
            .attr("r", 0)
            .attr("fill", color)
            .attr("stroke", color);
    });

    window.scatterPlotState.breedGroups.append("circle")
        .attr("class", "breed-mean")
        .attr("cx", ([breed, stats]) => window.scatterPlotState.xScale(stats.humanMean))
        .attr("cy", ([breed, stats]) => window.scatterPlotState.yScale(stats.catMean))
        .attr("r", 5)
        .attr("fill", ([breed]) => breedColors[breed])
        .on("mouseenter", function (event, [breed, stats]) {
            const breedGroup = this.parentNode;
            breedGroup.parentNode.appendChild(breedGroup);

            const labelLayer = window.scatterPlotState.chartSvg.select(".label-layer").node();
            if (labelLayer) {
                labelLayer.parentNode.appendChild(labelLayer);
            }

            const currentSection = window.currentSection || 0;
            if (currentSection === 1) {
                d3.select(this.parentNode).selectAll(".individual-dot").classed("active", true);
            }
            const baseSize = currentSection === 0 ? 5 : 3;
            d3.select(this)
                .classed("active", true)
                .attr("r", baseSize * 1.5);
            window.scatterPlotState.chartSvg.selectAll(`.breed-label-text[data-breed="${breed}"]`).classed("active", true);

            const displayBreed = breed.replace(/_/g, ' ');
            const showDeviation = currentSection === 1;
            const humanText = showDeviation
                ? `Human Sociability: ${stats.humanMean.toFixed(2)} (±${stats.humanStd.toFixed(2)})`
                : `Human Sociability: ${stats.humanMean.toFixed(2)}`;
            const catText = showDeviation
                ? `Cat Sociability: ${stats.catMean.toFixed(2)} (±${stats.catStd.toFixed(2)})`
                : `Cat Sociability: ${stats.catMean.toFixed(2)}`;
            tooltip.classed("visible", true)
                .html(`
                    <strong>${displayBreed}</strong><br/>
                    ${humanText}<br/>
                    ${catText}<br/>
                    Sample: ${stats.count} cats
                `);
        })
        .on("mousemove", function (event) {
            const chartDiv = document.getElementById('chart');
            const chartDivRect = chartDiv.getBoundingClientRect();
            tooltip
                .style("left", (chartDivRect.left + 70) + "px")
                .style("top", (chartDivRect.top + 50) + "px");
        })
        .on("mouseleave", function (event, [breed, stats]) {
            const currentSection = window.currentSection || 0;
            const baseSize = currentSection === 0 ? 5 : 3;
            d3.select(this)
                .classed("active", false)
                .attr("r", baseSize);
            d3.select(this.parentNode).selectAll(".individual-dot").classed("active", false);
            window.scatterPlotState.chartSvg.selectAll(`.breed-label-text[data-breed="${breed}"]`).classed("active", false);
            tooltip.classed("visible", false);
        });

    const labelLayer = svg.append("g").attr("class", "label-layer");

    labelLayer.selectAll(".breed-label-text")
        .data(Array.from(window.scatterPlotState.filteredBreedStats.entries()))
        .enter()
        .append("text")
        .attr("class", "breed-label-text")
        .attr("x", ([breed, stats]) => window.scatterPlotState.xScale(stats.humanMean))
        .attr("y", ([breed, stats]) => window.scatterPlotState.yScale(stats.catMean) - 15)
        .text(([breed]) => breed.replace(/_/g, ' '))
        .attr("data-breed", ([breed]) => breed);

    return window.scatterPlotState;
}

function updateGrid() {
    if (!window.scatterPlotState.xGridLines || !window.scatterPlotState.yGridLines || !window.scatterPlotState.xScale || !window.scatterPlotState.yScale || !window.scatterPlotState.chartHeight || !window.scatterPlotState.chartWidth) return;

    window.scatterPlotState.xGridLines.selectAll("line").remove();
    window.scatterPlotState.yGridLines.selectAll("line").remove();

    window.scatterPlotState.xGridLines.selectAll("line.x-grid")
        .data(window.scatterPlotState.xScale.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", d => window.scatterPlotState.xScale(d))
        .attr("x2", d => window.scatterPlotState.xScale(d))
        .attr("y1", 0)
        .attr("y2", window.scatterPlotState.chartHeight);

    window.scatterPlotState.yGridLines.selectAll("line.y-grid")
        .data(window.scatterPlotState.yScale.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", window.scatterPlotState.chartWidth)
        .attr("y1", d => window.scatterPlotState.yScale(d))
        .attr("y2", d => window.scatterPlotState.yScale(d));
}

function updateAxes() {
    if (!window.scatterPlotState.xAxis || !window.scatterPlotState.yAxis || !window.scatterPlotState.xScale || !window.scatterPlotState.yScale) return;

    window.scatterPlotState.xAxis.call(d3.axisBottom(window.scatterPlotState.xScale).ticks(8))
        .selectAll("text")
        .style("font-size", "11px");

    window.scatterPlotState.yAxis.call(d3.axisLeft(window.scatterPlotState.yScale).ticks(8))
        .selectAll("text")
        .style("font-size", "11px");
}

function updateScatterPlot(section) {
    if (!window.scatterPlotState.xScale || !window.scatterPlotState.yScale || !window.scatterPlotState.breedGroups || !window.scatterPlotState.chartWidth || !window.scatterPlotState.chartHeight) return;

    const t = window.scatterPlotState.chartSvg.transition().duration(800);

    if (section === 0) {
        window.scatterPlotState.xScale.domain([-1, 1]);
        window.scatterPlotState.yScale.domain([-1, 1]);

        window.scatterPlotState.chartSvg.selectAll(".breed-mean")
            .transition(t)
            .attr("cx", d => window.scatterPlotState.xScale(d[1].humanMean))
            .attr("cy", d => window.scatterPlotState.yScale(d[1].catMean))
            .attr("r", 5);

        window.scatterPlotState.chartSvg.selectAll(".individual-dot")
            .transition(t)
            .attr("cx", d => window.scatterPlotState.xScale(d.human_sociability))
            .attr("cy", d => window.scatterPlotState.yScale(d.cat_sociability))
            .attr("r", 0);

    } else if (section === 1) {
        window.scatterPlotState.xScale.domain([-5, 3]);
        window.scatterPlotState.yScale.domain([-5, 2]);

        window.scatterPlotState.chartSvg.selectAll(".breed-mean")
            .transition(t)
            .attr("cx", d => window.scatterPlotState.xScale(d[1].humanMean))
            .attr("cy", d => window.scatterPlotState.yScale(d[1].catMean))
            .attr("r", 3);

        window.scatterPlotState.chartSvg.selectAll(".individual-dot")
            .transition(t)
            .attr("cx", d => window.scatterPlotState.xScale(d.human_sociability))
            .attr("cy", d => window.scatterPlotState.yScale(d.cat_sociability))
            .attr("r", 1);
    }

    window.scatterPlotState.xAxis.transition(t)
        .call(d3.axisBottom(window.scatterPlotState.xScale).ticks(8))
        .selectAll("text")
        .style("font-size", "11px");

    window.scatterPlotState.yAxis.transition(t)
        .call(d3.axisLeft(window.scatterPlotState.yScale).ticks(8))
        .selectAll("text")
        .style("font-size", "11px");

    window.scatterPlotState.xGridLines.selectAll("line").remove();
    window.scatterPlotState.yGridLines.selectAll("line").remove();

    window.scatterPlotState.xGridLines.selectAll("line.x-grid")
        .data(window.scatterPlotState.xScale.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", d => window.scatterPlotState.xScale(d))
        .attr("x2", d => window.scatterPlotState.xScale(d))
        .attr("y1", 0)
        .attr("y2", window.scatterPlotState.chartHeight);

    window.scatterPlotState.yGridLines.selectAll("line.y-grid")
        .data(window.scatterPlotState.yScale.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", window.scatterPlotState.chartWidth)
        .attr("y1", d => window.scatterPlotState.yScale(d))
        .attr("y2", d => window.scatterPlotState.yScale(d));

    window.scatterPlotState.chartSvg.selectAll(".breed-label-text")
        .transition(t)
        .attr("x", function () {
            const breed = d3.select(this).attr("data-breed");
            const stats = window.scatterPlotState.filteredBreedStats.get(breed);
            return stats ? window.scatterPlotState.xScale(stats.humanMean) : 0;
        })
        .attr("y", function () {
            const breed = d3.select(this).attr("data-breed");
            const stats = window.scatterPlotState.filteredBreedStats.get(breed);
            return stats ? window.scatterPlotState.yScale(stats.catMean) - 15 : 0;
        });
}

function toggleBreedVisibility(breed, isVisible) {
    if (!window.scatterPlotState.chartSvg) return;

    const breedGroup = window.scatterPlotState.chartSvg.selectAll(`.breed-group[data-breed="${breed}"]`);

    if (isVisible) {
        breedGroup.style('opacity', 1);
        breedGroup.style('pointer-events', 'all');
    } else {
        breedGroup.style('opacity', 0.0);
        breedGroup.style('pointer-events', 'none');
    }
}

function getScatterPlotState() {
    return window.scatterPlotState;
}

window.createScatterPlot = createScatterPlot;
window.updateScatterPlot = updateScatterPlot;
window.toggleBreedVisibility = toggleBreedVisibility;