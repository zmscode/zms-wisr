import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader } from "lucide-react";

const ABNLookupDialog = ({ abnLookupOpen, setAbnLookupOpen }) => {
  const [lookupValue, setLookupValue] = useState("39119503221");
  const [lookupResult, setLookupResult] = useState({});
  const [lookupResultRaw, setLookupResultRaw] = useState("");
  const [error, setError] = useState(false);

  const onClose = () => {
    setLookupValue("");
    setLookupResult({});
    setLookupResultRaw("");
    setError(false);
    setAbnLookupOpen(false);
  };

  const resetResults = () => {
    setLookupResult({});
    setLookupResultRaw("");
    setError(false);
  };

  return (
    <Dialog open={abnLookupOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-none w-auto h-auto p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-neutral-100">ABN Lookup</DialogTitle>
          <DialogDescription>
            Enter any ABN (11 digits) to get the details from the ABN Lookup.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <ErrorComponent onReset={resetResults} />
        ) : lookupResultRaw && Object.keys(lookupResult).length > 0 ? (
          <ResultComponent
            lookupResult={lookupResult}
            lookupResultRaw={lookupResultRaw}
            onReset={resetResults}
          />
        ) : (
          <SearchComponent
            lookupValue={lookupValue}
            setLookupValue={setLookupValue}
            setLookupResultRaw={setLookupResultRaw}
            setLookupResult={setLookupResult}
            setError={setError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ABNLookupDialog;

const ResultComponent = ({ lookupResult, lookupResultRaw, onReset }) => {
  return (
    <div className="text-neutral-100">
      <h1
        style={{
          fontWeight: "bold",
          fontSize: "1.1rem",
          marginBottom: 5,
          marginTop: 10,
        }}
      >
        Lookup Result:
      </h1>
      <pre>{lookupResultRaw}</pre>
      <Button className="w-full flex items-center mt-[20px]" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
};

const ErrorComponent = ({ onReset }) => {
  return (
    <div className="text-neutral-100">
      <h1
        style={{
          fontWeight: "bold",
          fontSize: "1.1rem",
          marginTop: 10,
        }}
      >
        Error:
      </h1>
      <p>There was an error performing the lookup.</p>
      <Button className="w-full flex items-center mt-[20px]" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
};

const SearchComponent = ({
  lookupValue,
  setLookupValue,
  setLookupResultRaw,
  setLookupResult,
  setError,
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        lookupABN();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lookupValue]);

  const lookupABN = () => {
    if (!lookupValue) return;
    if (lookupValue.length !== 11) return;

    setLoading(true);
    console.log("Setting loading to TRUE");

    fetch("/api/lookup-abn", {
      // fetch("http://localhost:3000/api/lookup-abn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ abn: lookupValue }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Non-200 response");
        }
        // Artificially delay to see spinner
        return new Promise((resolve) =>
          setTimeout(() => {
            resolve(res.json());
          }, 2000)
        );
      })
      .then((data) => {
        const rawOutput = data.data;
        setLookupResultRaw(rawOutput);

        const result = {
          entity_name: "",
          abn_status: "",
          entity_type: "",
          gst: "",
          location: "",
        };

        const mapping = {
          "Entity name": "entity_name",
          "ABN status": "abn_status",
          "Entity type": "entity_type",
          "Goods & Services Tax (GST)": "gst",
          "Main business location": "location",
        };

        rawOutput.split("\n").forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          const value = valueParts.join(":").trim();
          const keyTrimmed = key.trim();
          if (mapping[keyTrimmed] !== undefined) {
            result[mapping[keyTrimmed]] = value;
          }
        });

        setLookupResult(result);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(true);
      })
      .finally(() => {
        console.log("Setting loading to FALSE");
        setLoading(false);
      });
  };

  return (
    <>
      <Input
        className="text-neutral-100"
        type="text"
        placeholder="ABN"
        value={lookupValue}
        onChange={(e) => {
          const numericValue = e.target.value.replace(/\D/g, "").slice(0, 11);
          setLookupValue(numericValue);
        }}
      />
      {loading ? (
        <Button className="" disabled>
          <Loader className="animate-spin" />
          Loading...
        </Button>
      ) : (
        <Button onClick={lookupABN} className="w-full flex items-center gap-2">
          Lookup
        </Button>
      )}
    </>
  );
};

const Spinner = () => {
  return (
    <svg
      className="animate-spin h-5 w-5 text-black mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
};
