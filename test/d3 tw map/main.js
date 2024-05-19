const width = 800;
const height = 600;

const svg = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

const projection = d3.geoMercator()
    .center([121, 23.8])
    .scale(6000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

const popup = d3.select('#popup');

d3.json('twCounty2010.topo.json').then(data => {
    svg.append('g')
        .selectAll('path')
        .data(topojson.feature(data, data.objects.layer1).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#fa0')
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
});

function handleMouseOver(event, d) {
    const countyName = d.properties.COUNTYNAME;
    const [x, y] = d3.pointer(event);
    displayData(countyName, x, y);

    d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', '#ff9800')
}

function handleMouseOut() {
    hidePopup();

    d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', '#fa0')
}

function displayData(countyName, x, y) {
    d3.json('tw.json').then(data => {
        const records = data.records.filter(record => record.county === countyName);
        if (records.length > 0) {
            const filteredRecords = records.filter(record =>
                record.itemname === '懸浮固體' ||
                record.itemname === '氨氮' ||
                record.itemname === '溶氧飽和度' ||
                record.itemname === '河川污染分類指標'
            );

            const content = `
                <h3>${countyName}</h3>
                <div id="chart"></div>
            `;
            showPopup(content, x, y);

            const chartData = filteredRecords.map(record => ({
                name: record.itemname,
                value: parseFloat(record.itemvalue)
            }));

            createBarChart(chartData);
        } else {
            showPopup(`<h3>${countyName}</h3><p>無資料</p>`, x, y);
        }
    });
}

function showPopup(content, x, y) {
    popup.html(content)
        .style('left', `${x + 10}px`)
        .style('top', `${y}px`)
        .style('display', 'block');
}

function hidePopup() {
    popup.style('display', 'none');
}

function createBarChart(data) {
    const chartWidth = 300;
    const chartHeight = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, innerWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([innerHeight, 0]);

    const chart = popup.select('#chart')
        .append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const bars = chart.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.name))
        .attr('y', innerHeight)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('fill', 'steelblue');

    bars.transition()
        .duration(1000)
        .attr('y', d => yScale(d.value))
        .attr('height', d => innerHeight - yScale(d.value));

    chart.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-45)')
        .attr('dx', '-.8em')
        .attr('dy', '.15em');

    chart.append('g')
        .call(d3.axisLeft(yScale));
}