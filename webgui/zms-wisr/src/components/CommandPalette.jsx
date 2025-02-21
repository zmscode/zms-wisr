import { useState, useEffect } from "react";
import "react-cmdk/dist/cmdk.css";
import CommandPalette, { filterItems, getItemIndex } from "react-cmdk";
import { Search } from "lucide-react";

const CommandPaletteComponent = ({ setAbnLookupOpen }) => {
  const [page, setPage] = useState("root");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    function handleKeyDown(e) {
      if (
        (navigator?.platform?.toLowerCase().includes("mac")
          ? e.metaKey
          : e.ctrlKey) &&
        e.key === "k"
      ) {
        e.preventDefault();
        e.stopPropagation();

        setOpen((currentValue) => {
          return !currentValue;
        });
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredItems = filterItems(
    [
      {
        heading: "Home",
        id: "home",
        items: [
          {
            id: "abn_lookup",
            title: "ABN Lookup",
            heroIcon: <Search style={{ color: "#6C727F" }} />,
            onClick: () => {
              setAbnLookupOpen(true);
            },
          },
        //   {
        //     id: "settings",
        //     title: "Settings",
        //     icon: "CogIcon",
        //     onClick: () => {
        //       alert("Settings");
        //     },
        //   },
        //   {
        //     id: "projects",
        //     title: "Projects",
        //     icon: "RectangleStackIcon",
        //     onClick: () => {
        //       alert("Projects");
        //     },
        //   },
        ],
      },
      // {
      //   heading: "Other",
      //   id: "advanced",
      //   items: [
      //     {
      //       id: "developer-settings",
      //       title: "Developer settings",
      //       icon: "CodeBracketIcon",
      //       onClick: () => {
      //         alert("Developer settings");
      //       },
      //     },
      //     {
      //       id: "privacy-policy",
      //       title: "Privacy policy",
      //       icon: "LifebuoyIcon",
      //       onClick: () => {
      //         alert("Privacy policy");
      //       },
      //     },
      //     {
      //       id: "log-out",
      //       title: "Log out",
      //       icon: "ArrowRightOnRectangleIcon",
      //       onClick: () => {
      //         alert("Logging out...");
      //       },
      //     },
      //   ],
      // },
    ],
    search
  );

  return (
    <CommandPalette
      onChangeSearch={setSearch}
      onChangeOpen={setOpen}
      search={search}
      isOpen={open}
      page={page}
    >
      <CommandPalette.Page id="root">
        {filteredItems.length ? (
          filteredItems.map((list) => (
            <CommandPalette.List key={list.id} heading={list.heading}>
              {list.items.map(({ id, heroIcon, title, ...rest }) => (
                <CommandPalette.ListItem
                  key={id}
                  index={getItemIndex(filteredItems, id)}
                  {...rest}
                >
                  {heroIcon}
                  <div className="mx-2 text-md" style={{ color: "#D9DADD" }}>
                    {title}
                  </div>
                </CommandPalette.ListItem>
              ))}
            </CommandPalette.List>
          ))
        ) : (
          <CommandPalette.FreeSearchAction />
        )}
      </CommandPalette.Page>

      <CommandPalette.Page id="projects">
        {/* Projects page */}
      </CommandPalette.Page>
    </CommandPalette>
  );
};

export default CommandPaletteComponent;
