var app;

window.onload = function () {
    app = new App();
    app.init();
     $("#add-node-btn").click(function (){
        var node = {"id":document.getElementById("add-node-input-id").value,"group": document.getElementById("add-node-input-group").value};
        app.Add(node)
    });
};

window.onresize = function(event) {
    app.reload();
};


function App() {
    var path = "/GraphProvider";

    this.reload = function() {
        d3.select("svg").selectAll("*").remove();
        app.init();
    };

    this.change = function (newPath) {
        path = newPath;
        this.reload();
    };

    this.Add = function (node) {
        $.ajax({
            type: "POST",
            url: "http://localhost:5000/GraphProvider/Create",
            contentType: 'application/json',
            data: JSON.stringify(node),
        }).done(function () {
            app.reload();
        }).fail(function (msg) {
            view.error(msg)
        });
    };

    this.init = function() {
        var el   = document.getElementById("svg-main"); 
        var rect = el.getBoundingClientRect(); 
        
        var svg = d3.select("svg"),
            width = +rect.width,
            height = +rect.height;

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) {
                return d.id;
            }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        d3.json(path, function (error, graph) {
            if (error) throw error;

            var link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(graph.links)
                .enter().append("line")
                .attr("stroke-width", function (d) {
                    return Math.sqrt(d.value);
                });

            var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(graph.nodes)
                .enter().append("g")

            var circles = node.append("circle")
                .attr("r", 5)
                .attr("fill", function (d) {
                    return color(d.group);
                })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            var lables = node.append("text")
                .text(function (d) {
                    return d.id;
                })
                .attr('x', 6)
                .attr('y', 3);

            node.append("title")
                .text(function (d) {
                    return d.id;
                });

            simulation
                .nodes(graph.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(graph.links);

            function ticked() {
                link
                    .attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                node
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
            }
        });

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

};

}




