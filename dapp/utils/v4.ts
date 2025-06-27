export const createPoolKey = (args: {
  daoTokenAddress: `0x${string}`;
  liquidityTokenAddress: `0x${string}`;
  fee: number;
  tickSpacing: number;
  hooks: `0x${string}`;
}) => {
  let currency0 = args.daoTokenAddress;
  let currency1 = args.liquidityTokenAddress;
  if (args.daoTokenAddress > args.liquidityTokenAddress) {
    currency0 = args.liquidityTokenAddress;
    currency1 = args.daoTokenAddress;
  }

  return {
    currency0,
    currency1,
    fee: args.fee,
    tickSpacing: args.tickSpacing,
    hooks: args.hooks,
  };
};
