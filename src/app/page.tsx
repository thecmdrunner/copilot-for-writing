import { AutoCompleteEditor } from "@/components/AutoCompleteEditor";
import { Credits } from "@/components/Credits";
import { Instrument_Serif } from "next/font/google";
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

export default async function Home() {
  return (
    <main className="min-h-screen py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-6 rounded-xl p-5">
        <div
          className={`flex w-max items-end gap-3 font-bold ${instrumentSerif.className} overflow-visible`}
        >
          {/* <LucideSparkles className="h-8 w-8" /> */}
          <img
            src="https://img.icons8.com/?size=128&id=R59UyFhVgdnm&format=png"
            alt="Composer"
            className="h-20 w-20"
          />
          <p className="mb-1 flex items-center gap-2 overflow-visible bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 bg-clip-text text-5xl font-black text-transparent">
            Composer -
            <span className="text-muted-foreground text-lg">
              like Cursor, for writing
            </span>
          </p>
        </div>

        <AutoCompleteEditor />
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <Credits />
      </div>
    </main>
  );
}
