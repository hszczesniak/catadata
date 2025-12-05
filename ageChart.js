let ageChartSubSection = 0;
let ageChartInteracted = new Set();
let exploredMetrics = new Set(['human_sociability']);

function createAgeChart(catData, convertToCatYears, convertCatYearsToHuman) {
    ageChartSubSection = 0;
    ageChartInteracted.clear();
    exploredMetrics.clear();
    exploredMetrics.add('human_sociability');
    window.ageChartSubSection = ageChartSubSection;
    
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
            <label for="metricSelect" style="opacity: 0.3; pointer-events: none;">Metric: </label>
            <select id="metricSelect" style="opacity: 0.3; pointer-events: none;">
                <option value="human_sociability">Human Sociability</option>
                <option value="activity_playfulness">Activity/Playfulness</option>
            </select>
            <label style="margin-left: 15px; opacity: 0.3; pointer-events: none;" id="catYearsLabel">
                <input type="checkbox" id="catYearsToggle"> Use cat years
            </label>
        </div>
    `;

    d3.select("#chart").insert("div", ":first-child").html(selectorHTML);

    updateAgeChartNarrative();
    renderAgeChart('human_sociability', false, catData, convertToCatYears, convertCatYearsToHuman);
    
    document.getElementById('metricSelect').addEventListener('change', function (e) {
        const metric = e.target.value;
        const useCatYears = document.getElementById('catYearsToggle').checked;
        
        d3.select("#chart").select("svg").remove();
        document.querySelector('.age-legend')?.remove();
        renderAgeChart(metric, useCatYears, catData, convertToCatYears, convertCatYearsToHuman);
        checkAgeChartProgress('metric', metric);
    });

    document.getElementById('catYearsToggle').addEventListener('change', function (e) {
        const metric = document.getElementById('metricSelect').value;
        const useCatYears = e.target.checked;
        d3.select("#chart").select("svg").remove();
        document.querySelector('.age-legend')?.remove();
        renderAgeChart(metric, useCatYears, catData, convertToCatYears, convertCatYearsToHuman);
        if (useCatYears) {
            checkAgeChartProgress('catYears', true);
        }
    });
}

function updateAgeChartNarrative() {
    const metricNarratives = {
        'activity_playfulness': "Interesting! You can see that male and female cats are almost the same in terms of playfulness and that activity levels decrease over a cat's lifetime. So if you want an always playful cat, maybe consider fostering a younger one! Now feel free to explore other metrics on your own. Try Fearfulness, Human Aggression, or any other trait that interests you. When you're ready, scroll down to continue.",
        'fearfulness': "Fascinating! Fearfulness seems to show an increase during the early life of a cat, and then it remains somewhat steady. Feel free to explore more metrics or scroll down when you're ready to continue.",
        'human_aggression': "Interesting observation! Human aggression patterns are stronger in female cats, and they increase throughout a cat's lifetime. Explore more metrics or scroll down when ready.",
        'cat_sociability': "Notice the patterns in cat-to-cat relationships! These decrease a lot throughout a cat's life and even more so for female cats. Keep exploring or scroll down to continue.",
        'litterbox_issues': "Litterbox issues seem to increase over a cat's lifetime. If you're looking in cat years though, you may notice there's a small decrease at the start! Continue exploring or scroll down when you're ready.",
        'excessive_grooming': "Excessive grooming behaviors increase with age! Explore more or scroll when ready.",
        'human_sociability': "We can see the general trend that human sociability increases with age for all cats, and that male cats are generally more social than females. Although, you may notice that viewing with cat years makes it easier to see how human sociability changes during those early life stages. Kittens are quite sociable! Feel free to continue exploring or scroll down when ready.",
    };
    
    const baseNarratives = [
        "We've looked at how breed may affect personality, but what about other factors? Are male and female cats different and what can you expect to change as your cat grows up? Since we were just looking human sociability, we'll start there. Hover over any point on the chart to see detailed information about male and female cats at that age.",
        "Great! We can see the general trend that human sociability increases with age for all cats, and that male cats are generally more social than females. Now try switching to 'Cat Years' using the checkbox to see ages in a way that reflects feline development stages.",
        "Perfect! Cat years help us understand developmental stages better. A cat ages to an adult (18 human years) in just 1 year, and then ages more slowly after that. You may notice that viewing with cat years makes it easier to see how human sociability changes during those early life stages. Kittens are quite sociable! Now let's look at a different metric. Use the dropdown menu to select 'Activity/Playfulness' to see how energetic cats are at different ages.",
    ];
    
    const storyText = document.getElementById('storyText');
    if (!storyText) return;
    
    if (ageChartSubSection < 3) {
        storyText.textContent = baseNarratives[ageChartSubSection];
    } else {
        const currentMetric = document.getElementById('metricSelect')?.value;
        if (currentMetric && metricNarratives[currentMetric]) {
            storyText.textContent = metricNarratives[currentMetric];
        } else {
            storyText.textContent = baseNarratives[2];
        }
    }
}

function checkAgeChartProgress(action, value) {
    if (ageChartSubSection === 0 && action === 'hover') {
        ageChartInteracted.add('hover');
        advanceAgeChartSection();
    } else if (ageChartSubSection === 1 && action === 'catYears' && value === true) {
        ageChartInteracted.add('catYears');
        advanceAgeChartSection();
    } else if (ageChartSubSection === 2 && action === 'metric' && value === 'activity_playfulness') {
        ageChartInteracted.add('activity');
        exploredMetrics.add(value);
        advanceAgeChartSection();
    } else if (ageChartSubSection === 3 && action === 'metric') {
        exploredMetrics.add(value);
        updateAgeChartNarrative();
    }
}

function advanceAgeChartSection() {
    ageChartSubSection++;
    window.ageChartSubSection = ageChartSubSection;
    updateAgeChartNarrative();
    
    if (ageChartSubSection === 1) {
        const catYearsLabel = document.getElementById('catYearsLabel');
        if (catYearsLabel) {
            catYearsLabel.style.opacity = '1';
            catYearsLabel.style.pointerEvents = 'all';
        }
    } else if (ageChartSubSection === 2) {
        const metricSelect = document.getElementById('metricSelect');
        const metricLabel = document.querySelector('.metric-selector label[for="metricSelect"]');
        
        if (metricLabel) {
            metricLabel.style.opacity = '1';
            metricLabel.style.pointerEvents = 'all';
        }
        if (metricSelect) {
            metricSelect.style.opacity = '1';
            metricSelect.style.pointerEvents = 'all';
        }
    } else if (ageChartSubSection === 3) {
        const metricSelect = document.getElementById('metricSelect');
        if (metricSelect) {
            const additionalOptions = [
                { value: 'fearfulness', label: 'Fearfulness' },
                { value: 'human_aggression', label: 'Human Aggression' },
                { value: 'cat_sociability', label: 'Cat Sociability' },
                { value: 'litterbox_issues', label: 'Litterbox Issues' },
                { value: 'excessive_grooming', label: 'Excessive Grooming' }
            ];
            
            additionalOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                metricSelect.appendChild(option);
            });
        }
    }
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
            
            checkAgeChartProgress('hover', true);
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
            
            checkAgeChartProgress('hover', true);
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
window.ageChartSubSection = ageChartSubSection;