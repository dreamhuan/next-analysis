import React, { useEffect } from "react";
import { getI18n } from "@/api";

export default function Lang() {
  useEffect(() => {
    (async () => {
      const data = await getI18n();
      console.log(data);
    })();
  }, []);
  return <div>1234</div>;
}
