import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useProjectsStore } from "../store/projectsStore";
import { Card, Avatar, StatusBadge, RoleBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import type { TaskStatus } from "../types";

const STATUS_ORDER: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "QA",
  "DONE",
  "REOPENED",
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, tasks, fetchProjects, fetchTasks } = useProjectsStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && user) {
      const accessibleProjects = projects.filter(
        (p) =>
          user.role === "ADMIN" ||
          p.owner?.id === user.id ||
          p.members?.some((m) => m.id === user.id)
      );
      accessibleProjects.slice(0, 3).forEach((p) => fetchTasks(p.id));
    }
  }, [projects.length, user]);

  const myTasks = tasks.filter((t) => t.assignee?.id === user?.id);
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  const canCreateProject =
    user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const stats = [
    {
      label: "Projects",
      value: projects.length,
      icon: <FolderKanban size={20} />,
      color: "#6c63ff",
    },
    {
      label: "My Tasks",
      value: myTasks.length,
      icon: <CheckSquare size={20} />,
      color: "#22c55e",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: <TrendingUp size={20} />,
      color: "#f59e0b",
    },
    {
      label: "Completed",
      value: doneTasks,
      icon: <Users size={20} />,
      color: "#06b6d4",
    },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <p
            style={{
              color: "var(--text-3)",
              fontSize: "14px",
              marginBottom: "4px",
            }}
          >
            {greeting()},
          </p>
          <h1
            style={{
              // fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800,
              // background: 'linear-gradient(135deg, #fff 0%, var(--accent-2) 100%)',
              // WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #e0e0e0 0%, var(--accent-2) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            {user?.firstName} {user?.lastName}
          </h1>
          <div style={{ marginTop: "8px" }}>
            <RoleBadge role={user?.role ?? "MEMBER"} />
          </div>
        </div>
        {canCreateProject && (
          <Button
            icon={<Plus size={16} />}
            onClick={() => navigate("/projects")}
          >
            New Project
          </Button>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {stats.map((s) => (
          <Card
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius)",
                background: `${s.color}18`,
                border: `1px solid ${s.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.color,
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  color: "var(--text-3)",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {s.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* Recent Projects */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Recent Projects
            </h2>
            <button
              onClick={() => navigate("/projects")}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-2)",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {projects.slice(0, 5).map((p) => (
              <Card
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                style={{ padding: "16px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </p>
                    <p
                      style={{
                        color: "var(--text-3)",
                        fontSize: "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.description || "No description"}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "-4px",
                      flexShrink: 0,
                    }}
                  >
                    {p.members.slice(0, 3).map((m, i) => (
                      <Avatar
                        key={m.id}
                        firstName={m.firstName}
                        lastName={m.lastName}
                        size={24}
                        style={{
                          marginLeft: i > 0 ? "-6px" : 0,
                          border: "2px solid var(--bg-2)",
                        }}
                      />
                    ))}
                    {p.members.length > 3 && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-3)",
                          marginLeft: "6px",
                        }}
                      >
                        +{p.members.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {projects.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-3)",
                  background: "var(--bg-2)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px dashed var(--border)",
                }}
              >
                <FolderKanban
                  size={32}
                  style={{ marginBottom: "12px", opacity: 0.4 }}
                />
                <p style={{ fontSize: "14px" }}>No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            My Tasks
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {myTasks.slice(0, 6).map((t) => (
              <Card key={t.id} style={{ padding: "14px 16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                      textDecoration:
                        t.status === "DONE" ? "line-through" : "none",
                      color:
                        t.status === "DONE" ? "var(--text-3)" : "var(--text)",
                    }}
                  >
                    {t.title}
                  </p>
                  <StatusBadge status={t.status} size="sm" />
                </div>
              </Card>
            ))}
            {myTasks.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-3)",
                  background: "var(--bg-2)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px dashed var(--border)",
                }}
              >
                <CheckSquare
                  size={32}
                  style={{ marginBottom: "12px", opacity: 0.4 }}
                />
                <p style={{ fontSize: "14px" }}>No tasks assigned to you</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
