import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRecycleHub } from "@/hooks/useRecycleHub";

const statusStyles: Record<string, string> = {
  Complete: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
  Pending: "bg-amber-500/15 text-amber-200 border border-amber-500/20",
};

export default function TransactionHistory() {
  const { fullTransactionList } = useRecycleHub();
  const transactions = fullTransactionList.slice(0, 8);

  return (
    <Card className="rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl shadow-emerald-900/20">
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Transaction History</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Live enterprise credit feed</h2>
        </div>
        <div className="rounded-full bg-emerald-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">
          Updated live every minute
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-4">
        <Table className="w-full border-separate border-spacing-0 text-sm text-white">
          <TableHeader>
            <TableRow className="bg-white/5">
              <TableHead className="text-emerald-100">Date / Time</TableHead>
              <TableHead className="text-emerald-100">Transaction ID</TableHead>
              <TableHead className="text-emerald-100">Description</TableHead>
              <TableHead className="text-right text-emerald-100">Amount</TableHead>
              <TableHead className="text-right text-emerald-100">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell className="p-6 text-center text-sm text-muted-foreground" colSpan={5}>
                  No transactions yet. Complete a market purchase to start the history.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="bg-white/5 even:bg-white/0">
                  <TableCell className="font-medium text-slate-200">
                    {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-100">
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount} credits
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={statusStyles[transaction.status] ?? statusStyles.Complete}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
