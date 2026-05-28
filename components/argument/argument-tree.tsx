import { ArgumentNode } from "./argument-node";
import type { ArgumentTreeNode } from "@/server/db/queries/arguments";
import type { VoteValue } from "@/server/actions/votes";

const INDENT_CAP = 8;

type Props = {
  node: ArgumentTreeNode;
  myVotes: Map<string, "UP" | "DOWN">;
  isAuthenticated: boolean;
  depth?: number;
};

export function ArgumentTree({ node, myVotes, isAuthenticated, depth = 0 }: Props) {
  const visibleDepth = Math.min(depth, INDENT_CAP);
  const myVote: VoteValue = myVotes.get(node.id) ?? null;

  return (
    <div>
      <ArgumentNode
        argument={node}
        myVote={myVote}
        isAuthenticated={isAuthenticated}
        variant={depth === 0 ? "detail" : "node"}
        showReply
      />
      {node.replies.length > 0 && (
        <div
          className="mt-2 space-y-2 border-l border-foreground/15 pl-3"
          style={{ marginLeft: visibleDepth === 0 ? 0 : 12 }}
        >
          {node.replies.map((child) => (
            <ArgumentTree
              key={child.id}
              node={child}
              myVotes={myVotes}
              isAuthenticated={isAuthenticated}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
