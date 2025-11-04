'use client';

import { Button, Box } from '@chakra-ui/react';
import { WalletButton, useAccountModal } from '@vechain/vechain-kit';

export function UIControls() {
    const { open } = useAccountModal();

    return (
        <Button onClick={open}>
            <Box w={'fit-content'}>
                <WalletButton
                    mobileVariant="icon"
                    desktopVariant="icon"
                />
            </Box>
        </Button>
    );
}
