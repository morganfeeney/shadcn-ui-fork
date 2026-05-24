import { Avatar } from "@/components/zippystarter/avatar";
import { avatars } from "@/data/avatars";

const defaultProps = {
  src: avatars.travelBug.avatarSrc,
  alt: avatars.travelBug.avatarName,
};

export function Demo() {
  return (
    <div className="@container h-full place-content-center p-8">
      <div className="grid grid-flow-col justify-around max-w-2xl mx-auto items-end gap-1">
        <Avatar {...defaultProps} size="xs" />
        <Avatar {...defaultProps} size="sm" />
        <Avatar {...defaultProps} size="md" />
        <Avatar {...defaultProps} size="lg" />
        <Avatar {...defaultProps} size="xl" />
        <Avatar {...defaultProps} size="2xl" />
      </div>
    </div>
  );
}
