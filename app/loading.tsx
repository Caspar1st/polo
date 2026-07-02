import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <PoloPonyLoader size={140} />
    </div>
  );
}
