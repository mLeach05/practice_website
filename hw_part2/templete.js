// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const height = 500;
    const width = 500;
    const margins = {top:50, right:50, bottom:50, left:50};

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", `translate(${margins.left},${margins.top})`);
    

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.AgeGroup))])
        .range([margins.left, width - margins.right])
        .paddingInner(0.3)
        .paddingOuter(0.2);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .range([height - margins.bottom, margins.top])

    // Add scales     
    const xAxis = svg.append('g')
        .call(d3.axisBottom().scale(xScale))
        .attr('transform', `translate(0,${height - margins.bottom})`);
    const yAxis = svg.append('g')
        .call(d3.axisLeft().scale(yScale))
        .attr('transform', `translate(${margins.left},0)`);

    // Add x-axis label
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height - 10)
        .text('Age Group');
    
    // Add y-axis label
    svg.append('text')
    .attr('x', -height/2)
    .attr('y', 15)
    .attr('transform', 'rotate(-90)')
    .text('Number of Likes');

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const q2 = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, q2, q3, max};
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        //line for min to q1
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("x2", x + boxWidth / 2)
            .attr("y2", yScale(quantiles.q1))
            .attr("stroke", "black");
        //line for q3 to max
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.q3))
            .attr("x2", x + boxWidth / 2)
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");
        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");
        // Draw median line
        svg.append('line')
            .attr('x1', x)
            .attr('y1', yScale(quantiles.q2))
            .attr('x2', x + boxWidth)
            .attr('y2', yScale(quantiles.q2))
            .attr('stroke', 'black');
    });
});

// Prepare your data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
     // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const height = 500;
    const width = 500;
    const margins = {top:50, right:50, bottom:50, left:50};

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", `translate(${margins.left},${margins.top})`);
    

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand().domain([...new Set(data.map(d => d.Platform))])
      .range([margins.left , width- margins.right])
      .paddingInner(0.2);
  

    const x1 = d3.scaleBand().domain([...new Set(data.map(d => d.PostType))])
      .range([0, x0.bandwidth()])

    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.Likes)])
      .range([height - margins.bottom, margins.top]);
      

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
    const xAxis = svg.append('g')
      .call(d3.axisBottom().scale(x0))
      .attr('transform', `translate(0,${height - margins.bottom})`);

    const yAxis = svg.append('g')
      .call(d3.axisLeft().scale(y))
      .attr('transform', `translate(${margins.left},0)`);

    // Add x-axis label
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height-15)
      .text('Platform');

    // Add y-axis label
    svg.append('text')
      .attr('x', -height/2).attr('x', -height/2)
      .attr('y', 10)
      .attr('transform', 'rotate(-90)')
      .text('Avg number of Likes')
  

  // Group container for bars
    const barGroups = svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    barGroups.append("rect")
      .attr("x", d => x1(d.PostType))
      .attr("y", d => y(d.Likes))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - margins.bottom - y(d.Likes))
      .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, ${margins.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 135)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
      legend.append("rect")
          .attr('y', i * 20 + 5 )
          .attr('x', 120)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', color(type) );
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
     // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const height = 500;
    const width = 500;
    const margins = {top:50, right:50, bottom:50, left:50};

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", `translate(${margins.left},${margins.top})`);    

    // Set up scales for x and y axes  
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.Date))
      .range([margins.left, width - margins.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .range([height - margins.bottom, margins.top])
        .nice();

    // Add scales x0 and y     
    const xAxis = svg.append('g')
      .call(d3.axisBottom().scale(xScale))
      .attr('transform', `translate(0,${height - margins.bottom})`)
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    const yAxis = svg.append('g')
      .call(d3.axisLeft().scale(yScale))
      .attr('transform', `translate(${margins.left},0)`);

    // Add x-axis label
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + 35)
      .text('Date');

    // Add y-axis label
    svg.append('text')
      .attr('x', -height/2).attr('x', -height/2)
      .attr('y', 10)
      .attr('transform', 'rotate(-90)')
      .text('Number of Likes')

    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Likes))
        .curve(d3.curveNatural);
    
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

});
