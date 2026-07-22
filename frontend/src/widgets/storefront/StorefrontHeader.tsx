import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Avatar, Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import type { Store } from '../../features/stores/model/types';
import { buildWhatsAppUrl } from '../../shared/lib/whatsapp';

type StorefrontHeaderProps = {
  store: Store;
};

export function StorefrontHeader({ store }: StorefrontHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ minHeight: 68, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack
            component={Link}
            to={`/shop/${encodeURIComponent(store.slug)}`}
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'center', color: 'inherit', textDecoration: 'none', minWidth: 0 }}
          >
            <Avatar
              src={store.logo_url ?? undefined}
              alt={store.name}
              sx={{ width: 40, height: 40 }}
            >
              <StorefrontOutlinedIcon />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" noWrap>
                {store.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Официальный магазин
              </Typography>
            </Box>
          </Stack>

          {store.phone && (
            <Button
              component="a"
              href={buildWhatsAppUrl(
                store.phone,
                `Здравствуйте! Хочу уточнить информацию о товарах магазина «${store.name}».`
              )}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<WhatsAppIcon />}
              sx={{ flexShrink: 0 }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Связаться
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                WhatsApp
              </Box>
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
