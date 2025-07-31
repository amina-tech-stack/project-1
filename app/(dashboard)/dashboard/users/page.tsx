import React from "react";
import Link from "next/link";
const page = () => {
  return (
    <div>
      <Link href="/dashboard/users/1">
        <li>user 1</li>
      </Link>
      <Link href="/dashboard/users/2">
        <li>user 2</li>
      </Link>
      <Link href="/dashboard/users/3">
        <li>user 3</li>
      </Link>
      <Link href="/dashboard/users/4">
        <li>user 4</li>
      </Link>
    </div>
  );
};

export default page;
