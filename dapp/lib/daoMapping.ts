// {
//   name: "GatedDAO",
//   iconURL: "/logos/maker-mkr-logo.png",
//   token: "DAO",
//   tokenAddress: "0x7b33F3F4EB34B30cC9239869c95018Cf486DB678",
//   emailDomain: "gateddao.com",
//   expectedDomain: "gmail.com",
//   domainHash: keccak256(stringToBytes("gmail.com")),
// },
// {
//   name: "MakerDAO",
//   iconURL: "/logos/maker-mkr-logo.png",
//   token: "MKR",
//   tokenAddress: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
//   emailDomain: "makerdao.com",
//   expectedDomain: "gmail.com",
//   domainHash: keccak256(stringToBytes("outlook.com")),
// },

export type DAO = {
  name: string;
  iconURL: string;
  token: string;
  tokenAddress: string;
};

export type Pool = DAO & {
  poolId: string;
};

export const DAO_MAPPING: DAO[] = [
  {
    name: "GatedDAO",
    iconURL: "/logos/gated-pool-logo.jpeg",
    token: "DAO",
    tokenAddress: "0x54FA517F05e11Ffa87f4b22AE87d91Cec0C2D7E1",
  },
  {
    name: "Compound DAO",
    iconURL: "/logos/compound-comp-logo.png",
    token: "COMP",
    tokenAddress: "0x489c5CB7fD158B0A9E7975076D758268a756C025",
  },
  {
    name: "Uniswap DAO",
    iconURL: "/logos/uniswap-uni-logo.png",
    token: "UNI",
    tokenAddress: "0xa0194c01b45bA58482DC70446CB41Af62dd21a47",
  },
  {
    name: "Aave DAO",
    iconURL: "/logos/aave-aave-logo.png",
    token: "AAVE",
    tokenAddress: "0xC364dc740ecB6C411aE0de8e130c0199bA875724",
  },
  {
    name: "Yearn Finance DAO",
    iconURL: "/logos/yearn-finance-yfi-logo.png",
    token: "YFI",
    tokenAddress: "0x5b41A5c0Df16551f5edeAa2B2eDe2135F1a824DF",
  },
  {
    name: "Aragon DAO",
    iconURL: "/logos/aragon-ant-logo.png",
    token: "ANT",
    tokenAddress: "0xD7b45CbC28BA9ba8653665d5FB37167a2Afe35D9",
  },
  {
    name: "Balancer DAO",
    iconURL: "/logos/balancer-bal-logo.png",
    token: "BAL",
    tokenAddress: "0xC870a3dc444bF970Da13979E9CFAc1a01c198eac",
  },
  {
    name: "Synthetix DAO",
    iconURL: "/logos/synthetix-snx-logo.png",
    token: "SNX",
    tokenAddress: "0x01fa8dEEdDEA8E4e465f158d93e162438d61c9eB",
  },
  {
    name: "Gitcoin DAO",
    iconURL: "/logos/gitcoin-gtc-logo.png",
    token: "GTC",
    tokenAddress: "0xbe1d0dB61E7562d88eF1FAb7436d02b6d00ce728",
  },
  {
    name: "ENS DAO",
    iconURL: "/logos/ethereum-name-service-ens-logo.png",
    token: "ENS",
    tokenAddress: "0x63355a2ff725B11B6d82071c9FD710C0DCc71900",
  },
  {
    name: "Lido DAO",
    iconURL: "/logos/lido-dao-ldo-logo.png",
    token: "LDO",
    tokenAddress: "0x1cD40deb4196D219097499031922Ff690F9ea813",
  },
  {
    name: "Gnosis DAO",
    iconURL: "/logos/gnosis-gno-logo.png",
    token: "GNO",
    tokenAddress: "0xb9533D0548E87bf07eE4bAeb7B485Ba310902676",
  },
  {
    name: "1inch DAO",
    iconURL: "/logos/1inch-1inch-logo.png",
    token: "1INCH",
    tokenAddress: "0x958b482c4E9479a600bFFfDDfe94D974951Ca3c7",
  },
];
