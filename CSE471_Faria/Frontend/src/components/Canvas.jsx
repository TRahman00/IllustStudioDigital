import React, {
  useEffect,
  useRef
} from "react";


function Canvas({
  width,
  height,

  strokes,
  setStrokes,

  selectedTool,
  color,
  brushSize,

  isDrawing,
  setIsDrawing,

  addHistory
}) {

  const canvasRef =
    useRef(null);


  /* ----------------------------- */
  /* DRAW ALL STROKES */
  /* ----------------------------- */

  useEffect(() => {

    const canvas =
      canvasRef.current;

    if (!canvas)
      return;

    canvas.width = width;
    canvas.height = height;

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    strokes.forEach(
      (stroke) => {

        if (
          !stroke.points ||
          stroke.points.length === 0
        ) {
          return;
        }


        ctx.save();

        ctx.lineCap =
          "round";

        ctx.lineJoin =
          "round";

        ctx.lineWidth =
          stroke.size;


        /* ERASER */

        if (
          stroke.tool ===
          "eraser"
        ) {

          ctx.globalCompositeOperation =
            "destination-out";

        }

        else {

          ctx.globalCompositeOperation =
            "source-over";

          ctx.strokeStyle =
            stroke.color;
        }


        /* AIRBRUSH */

        if (
          stroke.tool ===
          "airbrush"
        ) {

          stroke.points.forEach(
            (point) => {

              const gradient =
                ctx.createRadialGradient(
                  point.x,
                  point.y,
                  0,
                  point.x,
                  point.y,
                  stroke.size * 2
                );

              gradient.addColorStop(
                0,
                `${stroke.color}55`
              );

              gradient.addColorStop(
                1,
                `${stroke.color}00`
              );

              ctx.fillStyle =
                gradient;

              ctx.beginPath();

              ctx.arc(
                point.x,
                point.y,

                stroke.size * 2,

                0,
                Math.PI * 2
              );

              ctx.fill();

            }
          );

        }

        else {

          ctx.beginPath();

          ctx.moveTo(
            stroke.points[0].x,
            stroke.points[0].y
          );


          for (
            let i = 1;
            i < stroke.points.length;
            i++
          ) {

            ctx.lineTo(
              stroke.points[i].x,
              stroke.points[i].y
            );

          }

          ctx.stroke();

        }

        ctx.restore();

      }
    );

  }, [
    strokes,
    width,
    height
  ]);


  /* ----------------------------- */
  /* GET MOUSE POSITION */
  /* ----------------------------- */

  const getPoint = (
    event
  ) => {

    const canvas =
      canvasRef.current;

    const rect =
      canvas.getBoundingClientRect();

    return {

      x:
        ((event.clientX -
          rect.left) /
          rect.width) *
        canvas.width,

      y:
        ((event.clientY -
          rect.top) /
          rect.height) *
        canvas.height

    };

  };


  /* ----------------------------- */
  /* START DRAWING */
  /* ----------------------------- */

  const startDrawing = (
    event
  ) => {

    const point =
      getPoint(event);


    const newStroke = {

      tool:
        selectedTool,

      color:
        color,

      size:
        selectedTool === "pencil"
          ? brushSize * 0.55
          : brushSize,

      points: [
        point
      ]

    };


    setIsDrawing(true);

    setStrokes([
      ...strokes,
      newStroke
    ]);

  };


  /* ----------------------------- */
  /* DRAW */
  /* ----------------------------- */

  const draw = (
    event
  ) => {

    if (!isDrawing)
      return;


    const point =
      getPoint(event);


    const updated =
      [...strokes];


    const last =
      {
        ...updated[
          updated.length - 1
        ]
      };


    last.points = [
      ...last.points,
      point
    ];


    updated[
      updated.length - 1
    ] = last;


    setStrokes(updated);

  };


  /* ----------------------------- */
  /* STOP DRAWING */
  /* ----------------------------- */

  const stopDrawing = () => {

    if (!isDrawing)
      return;

    setIsDrawing(false);

    addHistory(strokes);

  };


  return (

    <div
      className="
        flex
        items-center
        justify-center

        w-full
        h-full

        overflow-auto

        bg-[#050908]

        p-8
      "
    >

      <div
        className="
          checkerboard

          canvas-container

          border
          border-[#1B302C]

          rounded-sm

          overflow-hidden
        "
      >

        <canvas
          ref={canvasRef}

          width={width}
          height={height}

          onPointerDown={
            startDrawing
          }

          onPointerMove={
            draw
          }

          onPointerUp={
            stopDrawing
          }

          onPointerCancel={
            stopDrawing
          }

          className="
            block

            max-w-[75vw]
            max-h-[65vh]

            w-auto
            h-auto

            cursor-crosshair

            touch-none
          "
        />

      </div>

    </div>

  );

}

export default Canvas;
