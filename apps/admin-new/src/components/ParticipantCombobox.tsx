// NOTE: remove the line below before editing this file
/* eslint-disable */
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command";
import { useQuery } from "@apollo/client";
import { GET_PARTICIPANTS_BY_STATUS_QUERY } from "@/graphql/participants.gql";
import { teamSchema } from "@/types/team";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

interface ITeamMember {
  _id: string;
  name: string;
  email: string;
  discordUsername?: string;
  tShirtSize?: string;
  checkInDates?: string[];
  status: string;
}

export function ComboboxParticipants({
  form,
}: {
  form: UseFormReturn<z.infer<typeof teamSchema>>;
}) {
  const { loading, error, data } = useQuery(GET_PARTICIPANTS_BY_STATUS_QUERY, {
    variables: { status: "accepted" },
  });

  const [selectedMembers, setSelectedMembers] = React.useState<ITeamMember[]>(
    form.getValues("teamMembers") || [],
  );

  const [open, setOpen] = React.useState(false);
  const participants: ITeamMember[] = data?.participantsByStatus || [];

  const toggleMemberSelection = (memberId: string) => {
    console.log(
      "🚀 ~ toggleMemberSelection ~ selectedMembers:",
      selectedMembers,
    );
    console.log(
      "🚀 ~ toggleMemberSelection ~ form.getValues teamMembers:",
      form.getValues("teamMembers"),
    );

    const isSelected =
      selectedMembers.some((m) => m.email === memberId) ||
      form.getValues("teamMembers").some((m) => m.email === memberId);

    if (isSelected) {
      const filteredMembers = selectedMembers.filter(
        (m) => m.email !== memberId,
      );
      setSelectedMembers(filteredMembers);
      form.setValue(
        "teamMembers",
        selectedMembers.filter((m) => m.email !== memberId),
      );
    } else {
      const memberToAdd = participants.find((m) => m.email === memberId);
      console.log("🚀 ~ toggleMemberSelection ~ memberToAdd:", memberToAdd);
      if (memberToAdd) {
        setSelectedMembers([...selectedMembers, memberToAdd]);
        form.setValue("teamMembers", [...selectedMembers, memberToAdd]);
      }
    }
  };

  if (loading) return <p>Loading participants...</p>;
  if (error) return <p>Error fetching participants: {error.message}</p>;
  if (participants.length === 0) return <p>No participants found.</p>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="flex w-full items-center justify-between"
        >
          <span className="max-w-full truncate">
            {selectedMembers.length > 0
              ? selectedMembers.map((m) => m.name).join(", ")
              : "Select members..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            {participants.map((member) => (
              <CommandItem
                key={member.email}
                onSelect={() => toggleMemberSelection(member.email)}
                className={
                  selectedMembers.some((m) => m.email === member.email)
                    ? "font-bold"
                    : ""
                }
              >
                <Check
                  className={
                    selectedMembers.some((m) => m.email === member.email)
                      ? "mr-2 h-4 w-4 opacity-100"
                      : "mr-2 h-4 w-4 opacity-0"
                  }
                />
                {member.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
