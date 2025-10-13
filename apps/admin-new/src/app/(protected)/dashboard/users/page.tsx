/* eslint-disable */
"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_USERS } from "@/graphql/user.gql";
import { useQuery } from "@apollo/client";
import { RefreshCwIcon } from "lucide-react";

export default function Page() {
  const { loading, error, data, refetch } = useQuery(GET_USERS);

  return (
    <div className="w-full space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="mr-4 text-3xl font-semibold">Users</h1>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCwIcon className="h-5 w-5" />
          <span>Refresh</span>
        </Button>
      </div>
      <UsersTable data={data} loading={loading} error={error} />
    </div>
  );
}

function UsersTable({
  data,
  loading,
  error,
}: {
  data: any;
  loading: boolean;
  error: any;
}) {
  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users!</p>;

  return (
    <Table className="w-full">
      <TableCaption>List of all registered users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
        
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Email Verified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.users.map((user: any) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.firstname}</TableCell>
            <TableCell>{user.lastname}</TableCell>
            <TableCell>{user.gender}</TableCell>
            <TableCell>{user.phone}</TableCell>
            <TableCell>{user.status}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.is_email_verified ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
