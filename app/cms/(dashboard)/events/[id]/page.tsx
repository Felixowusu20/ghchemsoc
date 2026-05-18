import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventRegistrationsClient } from "./event-registrations-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function EventRegistrationsPage(props: PageProps) {
  const { id } = await props.params;
  const exists = await prisma.societyEvent.findUnique({ where: { id }, select: { id: true } });
  if (!exists) notFound();
  return <EventRegistrationsClient eventId={id} />;
}
