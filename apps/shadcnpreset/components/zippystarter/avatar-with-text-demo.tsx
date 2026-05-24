import { avatars } from "@/data/avatars";
import {
  AvatarWithText,
  AvatarWithTextProps,
} from "@/components/zippystarter/avatar-with-text";

const defaultProps: AvatarWithTextProps = {
  src: avatars.travelBug.avatarSrc,
  name: avatars.travelBug.avatarName,
  subtitle: avatars.travelBug.avatarSubtitle,
};

export function Demo() {
  return (
    <div className="@container h-full place-content-center p-8">
      <div className="flex gap-12 justify-around max-w-8xl mx-auto items-end">
        <AvatarWithText {...defaultProps} size="xs" />
        <AvatarWithText {...defaultProps} size="sm" />
        <AvatarWithText {...defaultProps} size="md" />
        <AvatarWithText {...defaultProps} size="lg" />
        <AvatarWithText {...defaultProps} size="xl" />
        <AvatarWithText {...defaultProps} size="2xl" />
      </div>
    </div>
  );
}
