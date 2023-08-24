jsconsole = {
    update: function() {
        $("pre code").each(function(i, block) {
            hljs.highlightBlock(block);
        });
        var d = $("#console"); d.scrollTop(d[0].scrollHeight - d.height());
    },
    log: function(output) {
        output = convert(output);
        $("#logs").append("<pre class='logs'><code class='source js'><span class='arrow'><</span>"+output+"</code></pre>");
        if ($("#logs").children().length > 50) {
            $("#logs").find('pre:first').remove();
        }
        jsconsole.update();
    },
    error: function(output) {
        $("#logs").append("<pre class='logs error'><code class='nohighlight hljs'><span class='arrow'><</span>"+output+"</code></pre>");
        jsconsole.update();
    },
    toggle: function() {
        localStorage.setItem("console", $("#console").toggle().is(":visible"));
        editor.env.onResize();
    },
    clear: function() {
        $("#logs").empty();
    },
    new: function() {
        if (event.keyCode === 13) {
            var input = $("#input input").val().replace(/^[ \t]+/g, "");
            if (!input) return;
            $("#input input").val("");
            $("#logs").append("<pre class='logs in'><code class='nohighlight hljs'><span class='arrow'>></span>"+input+"</code></pre>");
            $("#output")[0].contentWindow.processing.println(input, true);
        }
    }
};

function convert(a) {
    if (typeof a === "string") a = '"'+a+'"';
    else if (Array.isArray(a)) a = '['+a+']';
    else if (typeof a === "object") a = JSON.stringify(a);
    return a;
}

if (localStorage.getItem("console") != $("#console").is(":visible").toString()) $("#console").toggle();


var search = location.search.substring(1);
var params = {};
search.split("&").forEach(function(param) {
    var tokens = param.split("=");
    params[tokens[0]] = tokens[1];
});

var code = localStorage.getItem("code") || "image(getImage('creatures/OhNoes-Hmm'), 20, 20);";
$("#editor").html(code);

var width = 400, height = 400;    
if (params.width) width = parseFloat(params.width);
if (params.height) height = parseFloat(params.height);

$("#editor").css("width", "calc(100% - "+(width+14)+"px)");
$("#output-container").css("width", width+4+"px");

var output = $("#output")[0];
output.width = width;
output.height = height;

var editor = ace.edit("editor");
editor.getSession().setMode("ace/mode/javascript");
editor.setOptions({
    fontSize: "14px" // 12px is kinda small
})
if (params.id) {
    fetch("https://www.khanacademy.org/api/internal/scratchpads/"+params.id)
        .then(response => response.json())
        .then(data => {
            editor.setValue(data.revision.code, -1);
        });
}

var editing = Date.now();

$("#ace-tm").html(".ace-tm .ace_gutter { background: #282c34; color: #525a6b; } .ace-tm .ace_print-margin { width: 1px; background: #3c4049; } .ace-tm .ace_fold { background-color: #525a6b; } .ace-tm { background-color: #282c34; color: #abb2bf; } .ace-tm .ace_cursor { color: #61afef; } .ace-tm .ace_invisible { color: red; } .ace-tm .ace_storage, .ace-tm .ace_keyword { color: #c477db; } .ace-tm .ace_constant { color: #dd6a73; } .ace-tm .ace_constant.ace_buildin { color: red; } .ace-tm .ace_constant.ace_language { color: #c99463; } .ace-tm .ace_constant.ace_library { color: red; } .ace-tm .ace_invalid { background-color: #e05252; color: white; } .ace-tm .ace_support.ace_function { color: #61afef; } .ace-tm .ace_support.ace_constant { color: #dd6a73; } .ace-tm .ace_support.ace_type, .ace-tm .ace_support.ace_class { color: #abb2bf; } .ace-tm .ace_keyword.ace_operator { color: #61afef; } .ace-tm .ace_string { color: #98c379; } .ace-tm .ace_comment { color: #525a6b; } .ace-tm .ace_comment.ace_doc { color: #525a6b; } .ace-tm .ace_comment.ace_doc.ace_tag { color: #c477db; } .ace-tm .ace_constant.ace_numeric { color: #c99463; } .ace-tm .ace_variable { color: #dd6a73; } .ace-tm .ace_xml-pe { color: #abb2bf; } .ace-tm .ace_entity.ace_name.ace_function { color: #61afef; } .ace-tm .ace_heading { color: red; } .ace-tm .ace_list { color: red; } .ace-tm .ace_meta.ace_tag { color: #dd6a73; } .ace-tm .ace_string.ace_regex { color: rged } .ace-tm .ace_marker-layer .ace_selection { background: #3e4451; } .ace-tm.ace_multiselect .ace_selection.ace_start { box-shadow: 0 0 3px 0px white; border-radius: 2px; } .ace-tm .ace_marker-layer .ace_step { background: red; } .ace-tm .ace_marker-layer .ace_stack { background: red; } .ace-tm .ace_marker-layer .ace_bracket { margin: -1px 0 0 -1px; border-bottom: 1px solid #61afef; } .ace-tm .ace_marker-layer .ace_active-line { background: rgba(255, 255, 255, 0.07); } .ace_problem_line { border-bottom-color: #61afef !IMPORTANT; } .ace-tm .ace_gutter-active-line { background-color: #2c323c; } .ace-tm .ace_marker-layer .ace_selected-word { background: #3e4451; border: 1px solid #525a6b; } .ace-tm .ace_indent-guide {}");

var updateCanvas = function() {
    $("#output").replaceWith($("#output").clone());
    var code = editor.getValue(), output = $("#output")[0].contentWindow;
    if (code) localStorage.setItem("code", code);
    $("#output").on("load", function() {
        output.updateCanvas(code, width, height);
    });
};
var update = function(delta) {  
    editing = Date.now();
    setTimeout(function() {
        if (Date.now()-editing >= 1000) {
            updateCanvas();
        }
    }, 1000);
};
updateCanvas();
editor.session.on("change", update);
