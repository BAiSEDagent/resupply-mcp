/**
 * Resupply Protocol Contract Addresses (Ethereum Mainnet)
 *
 * Source: https://github.com/resupplyfi/resupply/blob/main/deployment/contracts.json
 * Last updated: 2026-02-27
 */
export declare const ADDRESSES: {
    readonly CORE: "0xc07e000044F95655c11fda4cD37F70A94d7e0a7d";
    readonly STABLECOIN: "0x57aB1E0003F623289CD798B1824Be09a793e4Bec";
    readonly REGISTRY: "0x10101010E0C3171D894B71B3400668aF311e7D94";
    readonly INSURANCE_POOL: "0x00000000efe883b3304aFf71eaCf72Dbc3e1b577";
    readonly LIQUIDATION_HANDLER: "0x88888888c227c36401493Ed9F3e3Dcc3800B2634";
    readonly SREUSD: "0x557AB1e003951A73c12D16F0fEA8490E39C33C35";
    readonly PAIRS: {
        readonly CURVE_SFRXUSD: "0xC5184cccf85b81EDdc661330acB3E41bd89F34A1";
        readonly CURVE_SDOLA: "0x27AB448a75d548ECfF73f8b4F36fCc9496768797";
        readonly CURVE_SUSDE: "0x39Ea8e7f44E9303A7441b1E1a4F5731F1028505C";
        readonly CURVE_USDE: "0x3b037329Ff77B5863e6a3c844AD2a7506ABe5706";
        readonly CURVE_WBTC: "0x2d8ecd48b58e53972dBC54d8d0414002B41Abc9D";
        readonly CURVE_WETH: "0xCF1deb0570c2f7dEe8C07A7e5FA2bd4b2B96520D";
        readonly CURVE_WSTETH: "0x4A7c64932d1ef0b4a2d430ea10184e3B87095E33";
        readonly FRAX_SFRXETH: "0x3F2b20b8E8Ce30bb52239d3dFADf826eCFE6A5f7";
        readonly FRAX_SUSDE: "0x212589B06EBBA4d89d9deFcc8DDc58D80E141EA0";
        readonly FRAX_WBTC: "0xb5575Fe3d3b7877415A166001F67C2Df94D4e6c1";
        readonly FRAX_SCRVUSD: "0x24CCBd9130ec24945916095eC54e9acC7382c864";
    };
    readonly TOKENS: {
        readonly CRVUSD: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E";
        readonly FRXUSD: "0x0A5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8";
        readonly SFRXUSD: "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32";
    };
};
export type PairName = keyof typeof ADDRESSES.PAIRS;
//# sourceMappingURL=ADDRESSES.d.ts.map