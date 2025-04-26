import BaseChainIcon from "../assets/base.svg";

const TokenIcon = ({ logoURI }: { logoURI: string }) => {
  const isIPFS = logoURI.startsWith("Qm");
  const imageUrl = isIPFS
    ? `https://gateway.pinata.cloud/ipfs/${logoURI}`
    : logoURI;
  return (
    <div className="relative">
      <img src={imageUrl} className="w-6 h-6 rounded-full" alt="token" />
      <img
        src={BaseChainIcon}
        className="w-2 h-2 absolute bottom-0 right-0"
        alt="base chain"
      />
    </div>
  );
};

export default TokenIcon;
