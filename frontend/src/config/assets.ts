export interface RWAAsset {
    id: number;
    name: string;
    symbol: string;
    issuer: string;
    description: string;
    minCollateral: number;
    logoUrl?: string;
}

export const RWA_ASSETS: RWAAsset[] = [
    {
        id: 1,
        name: "Franklin Templeton BENJI",
        symbol: "BENJI",
        issuer: "GABC123...XYZ", // Mock issuer
        description: "Tokenized US Treasury money market fund",
        minCollateral: 100000,
        logoUrl: "/assets/benji.png"
    },
    {
        id: 2,
        name: "Ondo USDY",
        symbol: "USDY",
        issuer: "GDEF456...ABC",
        description: "Tokenized short-term US Treasuries",
        minCollateral: 50000,
        logoUrl: "/assets/usdy.png"
    },
    {
        id: 3,
        name: "Mock RWA Token",
        symbol: "MRWA",
        issuer: "GXYZ789...DEF",
        description: "Demo real-world asset for testing",
        minCollateral: 10000,
        logoUrl: "/assets/mrwa.png"
    }
];

export function getAssetById(id: number): RWAAsset | undefined {
    return RWA_ASSETS.find(a => a.id === id);
}
