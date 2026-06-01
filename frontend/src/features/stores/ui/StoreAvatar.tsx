import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { Avatar } from '@mui/material';

type StoreAvatarProps = {
  name: string;
  logoUrl?: string | null;
  size?: number;
};

export function StoreAvatar({ name, logoUrl, size = 44 }: StoreAvatarProps) {
  return (
    <Avatar
      src={logoUrl ?? undefined}
      variant="rounded"
      sx={{
        width: size,
        height: size,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 2,
        fontWeight: 800,
      }}
    >
      {name[0]?.toUpperCase() ?? <StorefrontOutlinedIcon fontSize="small" />}
    </Avatar>
  );
}