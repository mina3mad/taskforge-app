import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderKanban, Trash2, Edit2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectsStore } from '../store/projectsStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card, Avatar, EmptyState, Spinner } from '../components/ui/Badge';
import type { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const { projects, projectTotal, isLoading, fetchProjects, createProject, updateProject, deleteProject } = useProjectsStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const LIMIT = 9;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(projectTotal / LIMIT));
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchProjects({ page, limit: LIMIT }); }, [page]);

  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const canEditProject = (p: Project) =>
    user?.role === 'ADMIN' || (user?.role === 'PROJECT_MANAGER' && p.owner.id === user?.id);

  // const filtered = projects.filter((p) =>
  //   p.name.toLowerCase().includes(search.toLowerCase()) ||
  //   p.description?.toLowerCase().includes(search.toLowerCase())
  // );

  const openCreate = () => {
    setForm({ name: '', description: '' });
    setErrors({});
    setCreateOpen(true);
  };

  const openEdit = (p: Project) => {
    setForm({ name: p.name, description: p.description || '' });
    setErrors({});
    setEditProject(p);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Project name is required';
    return e;
  };

  const handleCreate = async () => {
     const e = validateForm();
  if (Object.keys(e).length) { setErrors(e); return; }
  setFormLoading(true);
  const p = await createProject({ 
    name: form.name, 
    description: form.description || undefined 
  });
  if (p) {
    await fetchProjects(); // refresh الـ list
    setCreateOpen(false);
    setFormLoading(false);
    navigate(`/projects/${p.id}`);
  } else {
    setFormLoading(false);
  }
  };

  const handleUpdate = async () => {
    if (!editProject) return;
    const e = validateForm();
    if (Object.keys(e).length) { setErrors(e); return; }
    setFormLoading(true);
    await updateProject(editProject.id, { name: form.name, description: form.description || undefined });
    setFormLoading(false);
    setEditProject(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteProject(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Projects</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '14px', marginTop: '4px' }}>
            {projectTotal} project{projectTotal !== 1 ? 's' : ''}
          </p>
        </div>
        {canManage && (
          <Button icon={<Plus size={16} />} onClick={openCreate}>New Project</Button>
        )}
      </div>

      {/* Search */}
      {/* <div style={{ marginBottom: '24px', maxWidth: '360px' }}>
        <Input
          placeholder="Search projects..."
          icon={<Search size={15} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div> */}

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Spinner size={36} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title="No projects found"
          description="Create your first project to get started"
          action={canManage ? <Button icon={<Plus size={16} />} onClick={openCreate}>New Project</Button> : undefined}
        />
      ) : (
      <>  
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {projects.map((p) => (
            <Card
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 'var(--radius)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FolderKanban size={18} color="var(--accent-2)" />
                </div>
                {canEditProject(p) && (
                  <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(p)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', transition: 'color var(--transition)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', transition: 'color var(--transition)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Name & desc */}
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{p.name}</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.5,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {p.description || 'No description'}
                </p>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Avatar firstName={p.owner.firstName} lastName={p.owner.lastName} size={22} />
                  <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                    {p.owner.firstName} {p.owner.lastName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', fontSize: '12px' }}>
                  <Users size={12} />
                  {p.members.length}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
          {projectTotal > LIMIT && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: '24px', padding: '0 4px',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 14px', borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)', background: 'var(--bg-2)',
                    color: page <= 1 ? 'var(--text-3)' : 'var(--text)',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 500,
                    transition: 'all var(--transition)',
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 14px', borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)', background: 'var(--bg-2)',
                    color: page >= totalPages ? 'var(--text-3)' : 'var(--text)',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 500,
                    transition: 'all var(--transition)',
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Project">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Project Name *"
            placeholder="e.g. Website Redesign"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Textarea
            label="Description"
            placeholder="What is this project about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button isLoading={formLoading} onClick={handleCreate}>Create Project</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Project Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setEditProject(null)}>Cancel</Button>
            <Button isLoading={formLoading} onClick={handleUpdate}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Project">
        <p style={{ color: 'var(--text-2)', marginBottom: '8px' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{deleteConfirm?.name}</strong>?
        </p>
        <p style={{ color: 'var(--text-3)', fontSize: '13px', marginBottom: '24px' }}>
          This action cannot be undone. All tasks in this project will be deleted.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Project</Button>
        </div>
      </Modal>
    </div>
  );
};
