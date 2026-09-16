import { useState } from "react";

import ScaleWrap from "../components/ScaleWrap.jsx";
import NavHeader from "../components/NavHeader.jsx";
import AvatarFigure from "../components/AvatarFigure.jsx";

import {
  REFERENCES,
  HEAD_HOTSPOTS,
  HAIR_HOTSPOTS,
  BODY_HOTSPOTS,
  ITEM_HOTSPOTS,
} from "../content/avatar-design.js";

const ACCENT = "#D96614";

const TABS = [
  "head",
  "body",
  "clothes",
  "items",
];

const SUBS = [
  "eyes",
  "nose",
  "mouth",
  "hair",
];

const TAB_HOTSPOTS = {
  head: [770, 261, 68, 31],
  body: [850, 261, 68, 31],
  clothes: [930, 261, 102, 31],
  items: [1035, 261, 95, 31],
};

const SUB_HOTSPOTS = {
  eyes: [770, 294, 68, 34],
  nose: [865, 294, 68, 34],
  mouth: [960, 294, 78, 34],
  hair: [1040, 294, 80, 34],
};

function Hotspot({
  box,
  onClick,
  title,
}) {
  const [left, top, width, height] = box;

  return (
    <>
      <button
        type="button"
        aria-label={title}
        title={title}
        onClick={onClick}
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          padding: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          cursor: "pointer",
          zIndex: 20,
        }}
      />
    </>
  );
}

function TabBarLabels({ names, hotspots, activeName, barBox }) {
  const [barLeft, barTop, barWidth, barHeight] = barBox;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: barLeft,
          top: barTop,
          width: barWidth,
          height: barHeight,
          background: "#ffffff",
          zIndex: 18,
          pointerEvents: "none",
        }}
      />

      {names.map((name) => {
        const [left, top, width, height] = hotspots[name];

        return (
          <div
            key={`${name}-label`}
            style={{
              position: "absolute",
              left,
              top,
              width,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: activeName === name ? ACCENT : "#000000",
              fontSize: 15,
              pointerEvents: "none",
              zIndex: 19,
            }}
          >
            {name}
          </div>
        );
      })}
    </>
  );
}

function CroppedReference({
  src,
  cropTop,
  height = 374,
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 402,
        height,
        overflow: "hidden",
        flex: "0 0 auto",
        background: "#ffffff",
      }}
    >
      <img
        src={src}
        alt=""
        draggable="false"
        style={{
          position: "absolute",
          width: 1440,
          height: 1024,
          left: -740,
          top: -cropTop,
          maxWidth: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function Avatar() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("head");
  const [sub, setSub] = useState("eyes");

  const [selection, setSelection] = useState({
    eyes: null,
    nose: null,
    mouth: null,
    hair: null,
    body: null,
    clothes: null,
    items: [],
  });

  const toggleSelection = (kind, index) => {
    setSelection((current) => ({
      ...current,
      [kind]:
        current[kind] === index
          ? null
          : index,
    }));
  };

  const toggleItem = (index) => {
    setSelection((current) => {
      const alreadySelected =
        current.items.includes(index);

      return {
        ...current,

        items: alreadySelected
          ? current.items.filter(
              (itemIndex) =>
                itemIndex !== index
            )
          : [
              ...current.items,
              index,
            ],
      };
    });
  };

  const activeReference =
    tab === "head"
      ? REFERENCES[sub]
      : REFERENCES[tab];

  const figureLeft =
    open ? 418 : 628.5;

  const figureTop =
    open ? 266 : 273;

  return (
    <ScaleWrap variant="fixed">
      <NavHeader />

      {!open ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 499,
              top: 217,
              width: 129,
              height: 1,
              background: "#000000",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 648,
              top: 208,
              fontSize: 15,
              whiteSpace: "nowrap",
            }}
          >
            make your avatar
          </div>

          <div
            style={{
              position: "absolute",
              left: 812,
              top: 217,
              width: 129,
              height: 1,
              background: "#000000",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 190,
            width: 760,
            height: 530,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <img
            src={activeReference}
            alt=""
            draggable="false"
            style={{
              position: "absolute",
              width: 1440,
              height: 1024,
              left: -400,
              top: -190,
              maxWidth: "none",
            }}
          />
        </div>
      )}

      {open && (
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 245,
            width: 220,
            height: 380,
            background: "#ffffff",
            zIndex: 8,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          left: figureLeft,
          top: figureTop,
          zIndex: 12,
          transition:
            "left .55s cubic-bezier(0.22,1,0.36,1), top .55s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <AvatarFigure
          selection={selection}
          onClick={() =>
            setOpen(
              (value) => !value
            )
          }
        />
      </div>

      {open && (
        <>
          <TabBarLabels
            names={TABS}
            hotspots={TAB_HOTSPOTS}
            activeName={tab}
            barBox={[780, 263, 340, 27]}
          />

          {TABS.map((name) => (
            <Hotspot
              key={name}
              box={
                TAB_HOTSPOTS[name]
              }
              title={name}
              onClick={() =>
                setTab(name)
              }
            />
          ))}

          {tab === "head" && (
            <TabBarLabels
              names={SUBS}
              hotspots={SUB_HOTSPOTS}
              activeName={sub}
              barBox={[780, 296, 330, 30]}
            />
          )}

          {tab === "head" &&
            SUBS.map((name) => (
              <Hotspot
                key={name}
                box={
                  SUB_HOTSPOTS[name]
                }
                title={name}
                onClick={() =>
                  setSub(name)
                }
              />
            ))}

          {tab === "head" &&
            sub !== "hair" &&
            HEAD_HOTSPOTS[sub].map(
              (
                box,
                index
              ) => (
                <Hotspot
                  key={`${sub}-${index}`}
                  box={box}
                  selected={
                    selection[sub] ===
                    index
                  }
                  title={`${sub} option ${
                    index + 1
                  }`}
                  onClick={() =>
                    toggleSelection(
                      sub,
                      index
                    )
                  }
                />
              )
            )}

          {tab === "head" &&
            sub === "hair" && (
              <div
                className="avatar-hair-scroll"
                style={{
                  position: "absolute",
                  left: 740,
                  top: 327,
                  width: 402,
                  height: 373,
                  overflowY: "auto",
                  overflowX: "hidden",
                  background: "#ffffff",
                  zIndex: 16,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 402,
                    height: 746,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                  >
                    <CroppedReference
                      src={
                        REFERENCES.hair
                      }
                      cropTop={327}
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 373,
                    }}
                  >
                    <CroppedReference
                      src={
                        REFERENCES.hair2
                      }
                      cropTop={327}
                    />
                  </div>

                  {HAIR_HOTSPOTS.map(
                    (
                      [
                        left,
                        top,
                        width,
                        height,
                      ],
                      index
                    ) => {
                      const localLeft =
                        left - 740;

                      const localTop =
                        top - 327;

                      return (
                        <button
                          key={`hair-a-${index}`}
                          type="button"
                          aria-label={`hair option ${
                            index + 1
                          }`}
                          onClick={() =>
                            toggleSelection(
                              "hair",
                              index
                            )
                          }
                          style={{
                            position:
                              "absolute",
                            left:
                              localLeft,
                            top:
                              localTop,
                            width,
                            height,
                            padding: 0,
                            border: "none",
                            background:
                              "transparent",
                            cursor:
                              "pointer",
                          }}
                        />
                      );
                    }
                  )}

                  {HAIR_HOTSPOTS.map(
                    (
                      [
                        left,
                        top,
                        width,
                        height,
                      ],
                      index
                    ) => {
                      const optionIndex =
                        index + 6;

                      const localLeft =
                        left - 740;

                      const localTop =
                        top -
                        327 +
                        373;

                      return (
                        <button
                          key={`hair-b-${index}`}
                          type="button"
                          aria-label={`hair option ${
                            optionIndex +
                            1
                          }`}
                          onClick={() =>
                            toggleSelection(
                              "hair",
                              optionIndex
                            )
                          }
                          style={{
                            position:
                              "absolute",
                            left:
                              localLeft,
                            top:
                              localTop,
                            width,
                            height,
                            padding: 0,
                            border: "none",
                            background:
                              "transparent",
                            cursor:
                              "pointer",
                          }}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {tab === "body" &&
            BODY_HOTSPOTS.map(
              (
                box,
                index
              ) => (
                <Hotspot
                  key={`body-${index}`}
                  box={box}
                  selected={
                    selection.body ===
                    index
                  }
                  title={
                    index === 0
                      ? "male"
                      : "female"
                  }
                  onClick={() =>
                    toggleSelection(
                      "body",
                      index
                    )
                  }
                />
              )
            )}

          {tab === "items" &&
            ITEM_HOTSPOTS.map(
              (
                box,
                index
              ) => (
                <Hotspot
                  key={`item-${index}`}
                  box={box}
                  selected={selection.items.includes(
                    index
                  )}
                  title={
                    [
                      "black glasses",
                      "scarf",
                      "watch",
                      "jewelry",
                      "orange glasses",
                    ][index]
                  }
                  onClick={() =>
                    toggleItem(index)
                  }
                />
              )
            )}

          <button
            type="button"
            onClick={() =>
              setOpen(false)
            }
            aria-label="close avatar options"
            style={{
              position: "absolute",
              left: 418,
              top: 266,
              width: 183,
              height: 317,
              border: 0,
              background:
                "transparent",
              cursor: "pointer",
              zIndex: 13,
            }}
          />
        </>
      )}
    </ScaleWrap>
  );
}
