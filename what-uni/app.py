from flask import Flask, render_template, abort, url_for, Response

app = Flask(__name__)

# TEMP data – we'll swap to your 4 pilot universities later
UNIVERSITIES = [
    {
        "slug": "example-uni-1",
        "name": "Example University One",
        "tagline": "Big city campus with strong business & law.",
        "location": "London",
    },
    {
        "slug": "example-uni-2",
        "name": "Example University Two",
        "tagline": "Green campus uni known for engineering.",
        "location": "Midlands",
    },
    {
        "slug": "example-uni-3",
        "name": "Example University Three",
        "tagline": "Coastal city with creative & media focus.",
        "location": "South Coast",
    },
    {
        "slug": "example-uni-4",
        "name": "Example University Four",
        "tagline": "Russell Group research uni with strong rankings.",
        "location": "North of England",
    },
]


@app.route("/")
def index():
    # Home page – AI advisor + list of universities
    return render_template("index.html", universities=UNIVERSITIES)


@app.route("/universities/<slug>")
def university_page(slug):
    uni = next((u for u in UNIVERsITIES if u["slug"] == slug), None)
    if not uni:
        abort(404)
    return render_template("university.html", uni=uni)


@app.route("/robots.txt")
def robots_txt():
    # Basic SEO-friendly robots.txt (you can tighten later)
    content = "User-agent: *\nAllow: /\nSitemap: " + url_for(
        "sitemap_xml", _external=True
    )
    return Response(content, mimetype="text/plain")


@app.route("/sitemap.xml")
def sitemap_xml():
    # Simple XML sitemap so Google can find pages
    urls = [url_for("index", _external=True)]
    for uni in UNIVERsITIES:
        urls.append(url_for("university_page", slug=uni["slug"], _external=True))

    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for u in urls:
        xml_parts.append("  <url><loc>{}</loc></url>".format(u))
    xml_parts.append("</urlset>")
    xml = "\n".join(xml_parts)
    return Response(xml, mimetype="application/xml")


if __name__ == "__main__":
    app.run(debug=True)