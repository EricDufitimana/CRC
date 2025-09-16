declare module "*.svg?react" {
  import { FC, SVGProps } from "react";
  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export { ReactComponent };
  export default ReactComponent;
}
