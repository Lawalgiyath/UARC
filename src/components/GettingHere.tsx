"use client";

import { useState } from "react";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { VENUE, googleMapsUrl, appleMapsUrl, mapEmbedUrl } from "@/lib/venue";

// How to reach the venue, with a map that does not load until it is wanted.
//
// The three links below are ordinary links: pressing one takes you to Google
// or Apple, and until you press it nothing on this page has spoken to either.
// The embedded map is different, because an iframe fetches as soon as it
// exists, so it is only put into the page once somebody presses the button.
//
// That is not caution for its own sake. The privacy notice tells delegates
// that the public pages set no cookies and carry no third-party tracking; an
// always-on Google embed would quietly make that untrue, and a privacy notice
// that is untrue is worse than none.

export function GettingHere() {
  const [showMap, setShowMap] = useState(false);

  return (
    <section className="getting-here">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Getting here</div>
          <h2>Finding {VENUE.name}</h2>
        </div>

        <div className="getting-here-grid">
          <div className="getting-here-card">
            <span className="getting-here-icon">
              <AcademicIcon name="city" size={22} />
            </span>
            <h3>The venue</h3>
            <address className="getting-here-address">
              {VENUE.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <div className="getting-here-links">
              <a className="btn" href={googleMapsUrl()} target="_blank" rel="noreferrer noopener">
                Directions in Google Maps
              </a>
              <a className="btn" href={appleMapsUrl()} target="_blank" rel="noreferrer noopener">
                Open in Apple Maps
              </a>
              <a className="btn" href={VENUE.campusMapUrl} target="_blank" rel="noreferrer noopener">
                University campus map and tour
              </a>
            </div>
          </div>

          <div className="getting-here-card">
            <span className="getting-here-icon">
              <AcademicIcon name="globe" size={22} />
            </span>
            <h3>Arriving</h3>
            <ul className="getting-here-notes">
              {VENUE.arrival.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="getting-here-map">
          {showMap ? (
            <iframe
              title={`Map showing ${VENUE.name}, University of Lagos`}
              src={mapEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="getting-here-map-placeholder">
              <span className="getting-here-icon">
                <AcademicIcon name="search" size={26} />
              </span>
              <h3>Show the map</h3>
              <p>
                The map comes from Google, which sets cookies in your browser and can see that you
                asked for it. Nothing has been loaded from Google yet, and nothing will be unless
                you press this.
              </p>
              <button className="btn solid" type="button" onClick={() => setShowMap(true)}>
                Load the map from Google
              </button>
              <p className="getting-here-map-alt">
                Or use the direction links above, which take you to Google or Apple without loading
                anything into this page.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
