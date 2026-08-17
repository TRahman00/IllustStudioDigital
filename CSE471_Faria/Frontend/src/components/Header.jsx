import {
  Sparkles,
  Moon
} from "lucide-react";

function Header({
  activeTab,
  setActiveTab
}) {

  const tabs = [
    "Draw",
    "Photo",
    "Animate"
  ];

  return (

    <header
      className="
        h-14
        flex
        items-center
        justify-between
        px-4

        bg-[#091311]

        border-b
        border-studio-border
      "
    >

      {/* LOGO */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            w-8
            h-8

            rounded-full

            flex
            items-center
            justify-center

            bg-studio-teal

            text-[#03100e]
          "
        >

          <Sparkles size={17} />

        </div>

        <span
          className="
            text-sm
            font-semibold
          "
        >
          Illust Studio
        </span>

      </div>


      {/* MODE NAVIGATION */}

      <div
        className="
          flex
          items-center

          bg-[#0B1816]

          rounded-lg

          p-1
        "
      >

        {tabs.map((tab) => (

          <button
            key={tab}

            onClick={() =>
              setActiveTab(tab)
            }

            className={`
              px-5
              py-2

              rounded-md

              text-xs
              font-medium

              transition

              ${
                activeTab === tab
                  ? `
                    bg-studio-teal
                    text-[#03100e]
                  `
                  : `
                    text-studio-muted
                    hover:text-studio-text
                  `
              }
            `}
          >

            {tab}

          </button>

        ))}

      </div>


      {/* THEME BUTTON */}

      <button
        className="
          w-8
          h-8

          rounded-full

          flex
          items-center
          justify-center

          bg-[#10201D]

          text-studio-teal
        "
      >

        <Moon size={16} />

      </button>

    </header>

  );
}

export default Header;
