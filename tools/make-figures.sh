#!/bin/bash
# Regenerate the tutorial figures as PNGs at 2x resolution:
#  - core diagrams drawn by tools/figures.htm with the shared renderer
#  - control panel pictures captured from SkeletonPlot19.htm
# Needs Google Chrome (or Chromium) and ImageMagick. Run from anywhere.
set -e
cd "$(dirname "$0")/.."
CHROME=${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Core diagrams: the page puts each canvas's PNG into a JSON block
"$CHROME" --headless=new --disable-gpu --no-sandbox --force-device-scale-factor=2 \
	--dump-dom "file://$PWD/tools/figures.htm" 2>/dev/null > "$TMP/figures.html"
python3 - "$TMP/figures.html" <<'PY'
import sys, json, base64, re, html
dom = open(sys.argv[1]).read()
data = json.loads(html.unescape(re.search(r'<pre id="output">(.*?)</pre>', dom, re.S).group(1)))
for name, fig in data.items():
    open("figure-%s.png" % name, "wb").write(base64.b64decode(fig["png"].split(",", 1)[1]))
    print("figure-%s.png  %dx%d" % (name, fig["width"], fig["height"]))
PY

# Control panel pictures: put the app in a known state, then crop parts of a screenshot.
# Element boxes come from a first run with --dump-dom; the second run takes the screenshot.
STATE='<script>
(function(){var a=1809;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();
</script>'
SHOW='<script>
var shots = {}, legends = {"Ring-growth anomalies":"anomalies","Magnification":"magnifications","Marking":"mouseactions","Core series settings":"sensitivity"};
document.querySelectorAll("#panel fieldset").forEach(function(f){ var n = legends[f.querySelector("legend").textContent]; if(n) shots[n] = f; });
function box(el){ var r = el.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round).join(" "); }
var out = [];
for (var n in shots) out.push(n + " " + box(shots[n]));
var show = document.querySelectorAll("#panel fieldset")[3];
document.querySelector("#panel button[value=Answer]").click();
out.push("showanswer " + box(show));
out.push("answers " + box(document.getElementById("answerBox")));
var p = document.createElement("pre"); p.id = "BOXES"; p.textContent = out.join("\n"); document.body.appendChild(p);
</script>'
cp *.htm *.js *.css "$TMP/"
perl -0pi -e 'BEGIN{$s=shift;$e=shift} s#(<head[^>]*>)#$1$s#i; s#(</body>)#$e$1#i' "$STATE" "$SHOW" "$TMP/SkeletonPlot19.htm"
"$CHROME" --headless=new --disable-gpu --no-sandbox --force-device-scale-factor=2 --window-size=1100,1000 --hide-scrollbars \
	--dump-dom "file://$TMP/SkeletonPlot19.htm" 2>/dev/null | sed -n '/<pre id="BOXES">/,/<\/pre>/p' | sed 's/<[^>]*>//g' > "$TMP/boxes.txt"
"$CHROME" --headless=new --disable-gpu --no-sandbox --force-device-scale-factor=2 --window-size=1100,1000 --hide-scrollbars \
	--screenshot="$TMP/app.png" "file://$TMP/SkeletonPlot19.htm" >/dev/null 2>&1
while read name x y w h; do
	[ -n "$name" ] || continue
	pad=4; [ "$name" = answers ] && pad=0	# the answer box floats over the graphs; crop it exactly
	magick "$TMP/app.png" -crop "$((w*2+pad*2))x$((h*2+pad*2))+$((x*2-pad))+$((y*2-pad))" +repage "figure-$name.png"
	echo "figure-$name.png  ${w}x${h}"
done < "$TMP/boxes.txt"

# The Master toggle picture is the same panel with Master shown instead of Answer
perl -0pi -e 's#button\[value=Answer\]#button[value=Master]#' "$TMP/SkeletonPlot19.htm"
"$CHROME" --headless=new --disable-gpu --no-sandbox --force-device-scale-factor=2 --window-size=1100,1000 --hide-scrollbars \
	--screenshot="$TMP/app2.png" "file://$TMP/SkeletonPlot19.htm" >/dev/null 2>&1
read name x y w h < <(grep '^showanswer' "$TMP/boxes.txt")
magick "$TMP/app2.png" -crop "$((w*2+8))x$((h*2+8))+$((x*2-4))+$((y*2-4))" +repage figure-showmaster.png
echo "figure-showmaster.png  ${w}x${h}"
