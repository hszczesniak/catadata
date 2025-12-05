function createAgeChart(catData, convertToCatYears, convertCatYearsToHuman) {
    const breedLegendAlt = document.querySelector('.breed-legend');
    if (breedLegendAlt) {
        breedLegendAlt.style.display = 'none';
        breedLegendAlt.style.visibility = 'hidden';
    }

    d3.select("#chart").selectAll("*").remove();

    const existingSelector = document.querySelector('.metric-selector');
    if (existingSelector) {
        existingSelector.remove();
    }

    const selectorHTML = `
        <div class="metric-selector">
            <label for="metricSelect">Metric: </label>
            <select id="metricSelect">
                <option value="human_sociability">Human Sociability</option>
                <option value="fearfulness">Fearfulness</option>
                <option value="human_aggression">Human Aggression</option>
                <option value="activity_playfulness">Activity/Playfulness</option>
                <option value="cat_sociability">Cat Sociability</option>
                <option value="litterbox_issues">Litterbox Issues</option>
                <option value="excessive_grooming">Excessive Grooming</option>
            </select>
            <label style="margin-left: 15px;">
                <input type="checkbox" id="catYearsToggle"> Use cat years
            </label>
        </div>
    `;

    d3.select("#chart").insert("div", ":first-child").html(selectorHTML);

    renderAgeChart('human_sociability', false, catData, convertToCatYears, convertCatYearsToHuman);
    
    document.getElementById('metricSelect').addEventListener('change', function (e) {
        const metric = e.target.value;
        const useCatYears = document.getElementById('catYearsToggle').checked;
        d3.select("#chart").select("svg").remove();
        document.querySelector('.age-legend')?.remove();
        renderAgeChart(metric, useCatYears, catData, convertToCatYears, convertCatYearsToHuman);
    });

    document.getElementById('catYearsToggle').addEventListener('change', function (e) {
        const metric = document.getElementById('metricSelect').value;
        const useCatYears = e.target.checked;
        d3.select("#chart").select("svg").remove();
        document.querySelector('.age-legend')?.remove();
        renderAgeChart(metric, useCatYears, catData, convertToCatYears, convertCatYearsToHuman);
    });
}

function renderAgeChart(metric, useCatYears, catData, convertToCatYears, convertCatYearsToHuman) {
    const ageData = catData.filter(cat =>
        !isNaN(cat.age) &&
        cat.age >= 0 &&
        cat.age <= 15 &&
        !isNaN(cat[metric])
    ).map(cat => ({
        ...cat,
        displayAge: useCatYears ? convertToCatYears(cat.age) : cat.age
    }));

    const maleData = ageData.filter(d => d.gender === 'Male');
    const femaleData = ageData.filter(d => d.gender === 'Female');

    const ageBins = d3.range(0, 16, 1);

    function calculateAgeMeans(data) {
        if (useCatYears) {
            const ageGroups = d3.group(data, d => Math.floor(d.displayAge / 5) * 5);
            const catYearBins = Array.from(ageGroups.keys()).sort((a, b) => a - b);

            return catYearBins.map(catYear => {
                const ageGroup = ageGroups.get(catYear);
                return {
                    age: catYear,
                    mean: ageGroup && ageGroup.length > 0 ? d3.mean(ageGroup, d => d[metric]) : null,
                    count: ageGroup ? ageGroup.length : 0
                };
            }).filter(d => d.mean !== null && d.count > 0);
        } else {
            const ageGroups = d3.group(data, d => Math.floor(d.displayAge));

            return ageBins.map(age => {
                const ageGroup = ageGroups.get(age);
                return {
                    age: age,
                    mean: ageGroup && ageGroup.length > 0 ? d3.mean(ageGroup, d => d[metric]) : null,
                    count: ageGroup ? ageGroup.length : 0
                };
            }).filter(d => d.mean !== null && d.count > 0);
        }
    }

    const maleMeans = calculateAgeMeans(maleData);
    const femaleMeans = calculateAgeMeans(femaleData);

    const margin = { top: 30, right: 60, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxAge = useCatYears
        ? Math.max(d3.max(maleMeans, d => d.age), d3.max(femaleMeans, d => d.age)) + 5
        : 15;

    const xScale = d3.scaleLinear()
        .domain([0, maxAge])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([
            Math.min(d3.min(maleMeans, d => d.mean), d3.min(femaleMeans, d => d.mean)) - 0.2,
            Math.max(d3.max(maleMeans, d => d.mean), d3.max(femaleMeans, d => d.mean)) + 0.2
        ])
        .range([height, 0]);

    svg.selectAll(".x-grid")
        .data(xScale.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", 0)
        .attr("y2", height);

    svg.selectAll(".y-grid")
        .data(yScale.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .selectAll("text")
        .style("font-size", "11px");

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(8))
        .selectAll("text")
        .style("font-size", "11px");

    const metricLabel = metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const ageLabel = useCatYears ? "Age (cat years)" : "Age (years)";

    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .text(ageLabel);

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text(metricLabel + " Score");

    const line = d3.line()
        .x(d => xScale(d.age))
        .y(d => yScale(d.mean))
        .curve(d3.curveLinear);

    svg.append("path")
        .datum(maleMeans)
        .attr("class", "line male")
        .attr("d", line)
        .attr("stroke", "#4facfe")
        .attr("fill", "none")
        .attr("stroke-width", 2);

    svg.append("path")
        .datum(femaleMeans)
        .attr("class", "line female")
        .attr("d", line)
        .attr("stroke", "#fa709a")
        .attr("fill", "none")
        .attr("stroke-width", 2);

    const tooltip = d3.select("#tooltip");

    svg.selectAll(".point.male")
        .data(maleMeans)
        .enter()
        .append("circle")
        .attr("class", "point male")
        .attr("cx", d => xScale(d.age))
        .attr("cy", d => yScale(d.mean))
        .attr("r", 3)
        .attr("fill", "#4facfe")
        .attr("stroke", "#2a7bd6")
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
            d3.select(this).attr("r", 5);

            let humanYear, catYear;
            if (useCatYears) {
                catYear = d.age;
                humanYear = convertCatYearsToHuman(catYear);
            } else {
                humanYear = d.age;
                catYear = convertToCatYears(humanYear);
            }

            const metricLabel = metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            tooltip.classed("visible", true)
                .html(`
                <strong>Male Cats</strong><br/>
                Age: ${humanYear.toFixed(1)} years (${catYear.toFixed(0)} cat years)<br/>
                ${metricLabel}: ${d.mean.toFixed(2)}<br/>
                Sample: ${d.count} cats
            `);
        })
        .on("mousemove", function (event) {
            const chartDiv = document.getElementById('chart');
            const chartDivRect = chartDiv.getBoundingClientRect();
            tooltip
                .style("left", (event.clientX - chartDivRect.left + 15) + "px")
                .style("top", (event.clientY - chartDivRect.top - 10) + "px");
        })
        .on("mouseleave", function () {
            d3.select(this).attr("r", 3);
            tooltip.classed("visible", false);
        });

    svg.selectAll(".point.female")
        .data(femaleMeans)
        .enter()
        .append("circle")
        .attr("class", "point female")
        .attr("cx", d => xScale(d.age))
        .attr("cy", d => yScale(d.mean))
        .attr("r", 3)
        .attr("fill", "#fa709a")
        .attr("stroke", "#d65a86")
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
            d3.select(this).attr("r", 5);

            let humanYear, catYear;
            if (useCatYears) {
                catYear = d.age;
                humanYear = convertCatYearsToHuman(catYear);
            } else {
                humanYear = d.age;
                catYear = convertToCatYears(humanYear);
            }

            const metricLabel = metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            tooltip.classed("visible", true)
                .html(`
                <strong>Female Cats</strong><br/>
                Age: ${humanYear.toFixed(1)} years (${catYear.toFixed(0)} cat years)<br/>
                ${metricLabel}: ${d.mean.toFixed(2)}<br/>
                Sample: ${d.count} cats
            `);
        })
        .on("mousemove", function (event) {
            const chartDiv = document.getElementById('chart');
            const chartDivRect = chartDiv.getBoundingClientRect();
            tooltip
                .style("left", (event.clientX - chartDivRect.left + 15) + "px")
                .style("top", (event.clientY - chartDivRect.top - 10) + "px");
        })
        .on("mouseleave", function () {
            d3.select(this).attr("r", 3);
            tooltip.classed("visible", false);
        });

    const existingLegend = document.querySelector('.age-legend');
    if (existingLegend) {
        existingLegend.remove();
    }

    const legendHTML = `
        <div class="age-legend">
            <div class="age-legend-item">
                <div class="age-legend-line" style="background: #4facfe;"></div>
                <span>Male Cats</span>
            </div>
            <div class="age-legend-item">
                <div class="age-legend-line" style="background: #fa709a;"></div>
                <span>Female Cats</span>
            </div>
        </div>
    `;

    d3.select("#chart").insert("div", ":first-child").html(legendHTML);
}

window.createAgeChart = createAgeChart;