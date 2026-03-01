"""
services/knowledge_graph.py — In-memory + database-backed knowledge graph.
Connects all entities across relationship, health, and school loops.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import uuid


@dataclass
class GraphNode:
    id: str
    user_id: str
    node_type: str      # person, medicine, event, school, prescription
    entity_id: str
    properties: dict = field(default_factory=dict)


@dataclass
class GraphEdge:
    id: str
    user_id: str
    from_node: str
    to_node: str
    relation_type: str  # reminds_about, prescribed_for, child_of, has_family_member
    weight: float = 1.0
    metadata: dict = field(default_factory=dict)


@dataclass
class GraphContext:
    nodes: list[GraphNode]
    edges: list[GraphEdge]

    def find_related(self, entity_id: str, relation_type: Optional[str] = None) -> list[GraphNode]:
        related_node_ids = set()
        for edge in self.edges:
            if relation_type and edge.relation_type != relation_type:
                continue
            if edge.from_node == entity_id:
                related_node_ids.add(edge.to_node)
            elif edge.to_node == entity_id:
                related_node_ids.add(edge.from_node)
        return [n for n in self.nodes if n.id in related_node_ids]


class KnowledgeGraph:
    """
    In-memory knowledge graph with optional DB persistence.
    
    Example graph for a user:
    User(Priya) --[has_family_member]--> Person(Mother, birthday: March 15)
    Person(Mother) --[takes_medicine]--> Medicine(Metformin 500mg)
    User(Priya) --[has_child]--> Child(Arjun, Class 5)
    Child(Arjun) --[attends_event]--> SchoolEvent(Annual Day, Dec 20)
    
    Enables cross-loop reasoning:
    "Mother's birthday is in 3 days AND she needs medicine refill — alert together"
    """

    def __init__(self):
        self._nodes: dict[str, dict] = {}  # user_id -> {node_id -> GraphNode}
        self._edges: dict[str, list] = {}  # user_id -> [GraphEdge]

    def get_context(self, user_id: str) -> GraphContext:
        nodes = list(self._nodes.get(user_id, {}).values())
        edges = self._edges.get(user_id, [])
        return GraphContext(nodes=nodes, edges=edges)

    def add_node(
        self,
        user_id: str,
        node_type: str,
        entity_id: str,
        properties: dict,
    ) -> GraphNode:
        node = GraphNode(
            id=str(uuid.uuid4()),
            user_id=user_id,
            node_type=node_type,
            entity_id=entity_id,
            properties=properties,
        )
        if user_id not in self._nodes:
            self._nodes[user_id] = {}
        self._nodes[user_id][node.id] = node
        return node

    def add_edge(
        self,
        user_id: str,
        from_node_id: str,
        to_node_id: str,
        relation_type: str,
        metadata: Optional[dict] = None,
    ) -> GraphEdge:
        edge = GraphEdge(
            id=str(uuid.uuid4()),
            user_id=user_id,
            from_node=from_node_id,
            to_node=to_node_id,
            relation_type=relation_type,
            metadata=metadata or {},
        )
        if user_id not in self._edges:
            self._edges[user_id] = []
        self._edges[user_id].append(edge)
        return edge

    def update(self, result: dict):
        """Update graph from agent result payload."""
        # Handled per-agent in agent execute() methods
        pass


knowledge_graph = KnowledgeGraph()
