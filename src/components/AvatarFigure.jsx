import {
  AVATAR_ANCHORS,
  OPTIONS,
} from "../content/avatar-design.js";

const DOTS = [
  [87, 212], [94, 212],
  [87, 220], [94, 220],
  [87, 228], [94, 228],
];

function CenteredLayer({ option, zIndex = 1 }) {
  if (!option?.image) return null;
  return (
    <img
      src={option.image}
      alt=""
      draggable="false"
      style={{
        position: "absolute",
        left: option.centerX,
        top: option.top,
        width: "auto",
        height: "auto",
        maxWidth: "none",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
}

function PositionedLayer({ src, left, top, zIndex = 1, width = "auto", height = "auto" }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      draggable="false"
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        maxWidth: "none",
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
}

function HairLayer({ option }) {
  if (!option?.image) return null;

  if (!option.includesHead) {
    return (
      <PositionedLayer
        src={option.image}
        left={option.left}
        top={option.top}
        zIndex={12}
      />
    );
  }

  const left = AVATAR_ANCHORS.faceCenterX - option.faceCenterX;
  const top = AVATAR_ANCHORS.faceCenterY - option.faceCenterY;

  return (
    <PositionedLayer
      src={option.image}
      left={left}
      top={top}
      zIndex={12}
    />
  );
}

function WatchLayer({ option }) {
  if (!option?.image) return null;
  return (
    <PositionedLayer
      src={option.image}
      left={option.left}
      top={option.top}
      width={12}
      height={10}
      zIndex={40}
    />
  );
}

function BaseHead() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 50,
          width: 97,
          height: 94,
          border: "1px solid #000000",
          borderRadius: "50%",
          background: "#ffffff",
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 83,
          top: 6,
          width: 17,
          height: 55,
          borderRadius: "50%",
          background: "#000000",
          zIndex: 11,
        }}
      />
    </>
  );
}

function DefaultGlasses() {
  return (
    <svg
      width="73"
      height="27"
      viewBox="0 0 73 27"
      fill="none"
      style={{
        position: "absolute",
        left: 55,
        top: 84,
        zIndex: 20,
      }}
    >
      <line x1="43" y1="14.5" x2="29" y2="14.5" stroke="black" />
      <path
        d="M15 0.5C23.059 0.5 29.5 6.36855 29.5 13.5C29.5 20.6315 23.059 26.5 15 26.5C6.94102 26.5 0.5 20.6315 0.5 13.5C0.5 6.36855 6.94102 0.5 15 0.5Z"
        stroke="black"
      />
      <path
        d="M58 0.5C66.059 0.5 72.5 6.36855 72.5 13.5C72.5 20.6315 66.059 26.5 58 26.5C49.941 26.5 43.5 20.6315 43.5 13.5C43.5 6.36855 49.94102 0.5 58 0.5Z"
        stroke="black"
      />
    </svg>
  );
}

function ItemLayers({ items }) {
  const jewelry = items.find(i => i.type === "jewelry") || null;
  const scarf   = items.find(i => i.type === "scarf")   || null;
  const watch   = items.find(i => i.type === "watch")   || null;
  const blackGlasses  = items.find(i => i.id === "glasses-black")  || null;
  const orangeGlasses = items.find(i => i.id === "glasses-orange") || null;

  return {
    body: (
      <>
        {scarf && (
          <PositionedLayer
            src={scarf.image}
            left={scarf.left}
            top={scarf.top}
            zIndex={18}
          />
        )}
        {watch && <WatchLayer option={watch} />}
      </>
    ),
    jewelry: (
      <>
        {jewelry && (
          <PositionedLayer
            src={jewelry.image}
            left={jewelry.left}
            top={jewelry.top}
            zIndex={24}
          />
        )}
      </>
    ),
    face: (
      <>
        {blackGlasses && (
          <CenteredLayer
            option={{ ...blackGlasses, centerX: 91.5, top: 84 }}
            zIndex={30}
          />
        )}
        {orangeGlasses && (
          <CenteredLayer
            option={{ ...orangeGlasses, centerX: 91.5, top: 84 }}
            zIndex={31}
          />
        )}
      </>
    ),
  };
}

export default function AvatarFigure({ selection, onClick, compact = false }) {
  const eye = selection.eyes == null ? null : OPTIONS.eyes[selection.eyes];
  const nose = selection.nose == null ? null : OPTIONS.nose[selection.nose];
  const mouth = selection.mouth == null ? null : OPTIONS.mouth[selection.mouth];
  const hair = selection.hair == null ? null : OPTIONS.hair[selection.hair];
  const body = selection.body == null ? OPTIONS.body[0] : OPTIONS.body[selection.body];

  const selectedItems = Array.isArray(selection.items)
    ? selection.items.map(i => OPTIONS.items[i]).filter(Boolean)
    : [];

  const hairProvidesHead = Boolean(hair?.includesHead);
  const selectedGlasses = selectedItems.some(item => item.type === "glasses");
  const showDefaultGlasses = !eye && !selectedGlasses;

  const itemLayers = ItemLayers({ items: selectedItems });

  return (
    <div
      className="avatar-figure"
      onClick={onClick}
      style={{
        position: "relative",
        width: 183,
        height: 317,
        cursor: onClick ? "pointer" : "default",
        transform: compact ? "scale(.92)" : "none",
        transformOrigin: "top left",
      }}
    >
      <CenteredLayer option={body} zIndex={5} />

      {itemLayers.body}

      {!hairProvidesHead && <BaseHead />}

      <HairLayer option={hair} />

      {itemLayers.jewelry}

      {showDefaultGlasses && <DefaultGlasses />}

      <CenteredLayer option={eye} zIndex={21} />
      <CenteredLayer option={nose} zIndex={22} />
      <CenteredLayer option={mouth} zIndex={23} />

      {itemLayers.face}
    </div>
  );
}