<template>
  <div style="max-width:1200px;padding-bottom:3rem">

    <!-- ══════════════════ ROOM LIST VIEW ══════════════════ -->
    <template v-if="!activeRoom">
      <div class="flex justify-between items-center page-header">
        <div>
          <p class="page-eyebrow">Collaborate</p>
          <h1 class="page-title">Group Study</h1>
          <p class="page-sub">Create or join a study group and learn together 🤝</p>
        </div>
        <button class="btn btn-primary" @click="showCreateForm = !showCreateForm">
          <Plus :size="18" /> Create Group
        </button>
      </div>

      <!-- Create Group Form -->
      <Transition name="panel">
        <div v-if="showCreateForm" class="dashed-card mb-6">
          <h3 style="margin-bottom:1.5rem">Create Study Group</h3>
          <form @submit.prevent="createRoom" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div class="form-group">
              <label class="form-label">Group Name</label>
              <input v-model="nf.name" type="text" class="form-input" :class="{error:fe.name}" placeholder="Biology Finals Squad" @input="fe.name=''" />
              <p v-if="fe.name" class="form-error">⚠ {{ fe.name }}</p>
            </div>
            <div class="form-group">
              <label class="form-label">Subject / Course</label>
              <input v-model="nf.subject" type="text" class="form-input" :class="{error:fe.subject}" placeholder="Biology 101" @input="fe.subject=''" />
              <p v-if="fe.subject" class="form-error">⚠ {{ fe.subject }}</p>
            </div>
            <div class="form-group">
              <label class="form-label">Study Goal</label>
              <input v-model="nf.goal" type="text" class="form-input" placeholder="Complete Chapters 5–8 by Friday" />
            </div>
            <div class="form-group">
              <label class="form-label">Visibility</label>
              <select v-model="nf.visibility" class="form-input">
                <option value="public">🌐 Public — anyone can join</option>
                <option value="private">🔒 Private — invite only</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Max Members</label>
              <select v-model="nf.maxMembers" class="form-input">
                <option v-for="n in [2,3,4,5,6,8,10,15,20]" :key="n" :value="n">{{ n }} members</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Academic Interest Tags</label>
              <input v-model="nf.tags" type="text" class="form-input" placeholder="STEM, Exam Prep, Research" />
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label class="form-label">Description</label>
              <textarea v-model="nf.description" class="form-input" rows="2" placeholder="What is this study group about?"></textarea>
            </div>
            <div class="flex gap-3 justify-end" style="grid-column:span 2">
              <button type="button" class="btn btn-outline" @click="showCreateForm=false">Cancel</button>
              <button type="submit" class="btn btn-primary">Create Group</button>
            </div>
          </form>
        </div>
      </Transition>

      <!-- Join by Code -->
      <div class="card mb-6" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;padding:1.25rem 1.5rem">
        <div style="flex:1;min-width:200px">
          <h4 style="margin:0 0 .2rem">Join via Invite Code</h4>
          <p class="text-sm text-muted">Have a code? Enter it to join a private or public group.</p>
        </div>
        <div class="flex gap-2">
          <input v-model="joinCode" type="text" class="form-input" placeholder="XXXXXX" maxlength="6"
            style="width:160px;text-transform:uppercase;letter-spacing:.12em;font-weight:600;text-align:center" />
          <button class="btn btn-primary" @click="joinByCode">Join Now</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-4" style="flex-wrap:wrap">
        <button v-for="f in ['all','public','private','mine']" :key="f"
          class="btn btn-sm" :class="listFilter===f?'btn-primary':'btn-outline'"
          @click="listFilter=f" style="text-transform:capitalize">{{ f === 'mine' ? 'My Groups' : f }}</button>
      </div>

      <!-- Room Grid -->
      <div v-if="!filteredRooms.length" class="card" style="text-align:center;padding:4rem 2rem;color:var(--muted)">
        <Users :size="52" style="margin:0 auto 1rem;opacity:.2" />
        <p>No study groups yet. Be the first to create one! 📖</p>
      </div>
      <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.25rem">
        <div v-for="room in filteredRooms" :key="room.id" class="room-card card"
          :style="`border-top:4px solid ${sColor(room.subject)}`">
          <div class="flex justify-between items-start mb-2">
            <div style="flex:1">
              <div class="flex items-center gap-2 mb-1">
                <h3 style="margin:0;font-size:1.1rem">{{ room.name }}</h3>
                <span style="font-size:.7rem;padding:.15rem .5rem;border-radius:var(--r-full);font-weight:600"
                  :style="room.visibility==='private'?'background:rgba(155,126,166,.15);color:#9b7ea6':'background:rgba(123,138,124,.15);color:var(--primary)'">
                  {{ room.visibility === 'private' ? '🔒 Private' : '🌐 Public' }}
                </span>
              </div>
              <p class="text-sm text-muted">{{ room.subject }}</p>
            </div>
            <span class="badge" :style="`background:${sColor(room.subject)}18;color:${sColor(room.subject)}`">
              {{ room.members.length }}/{{ room.maxMembers }}
            </span>
          </div>
          <p v-if="room.goal" class="text-sm mb-2">🎯 {{ room.goal }}</p>
          <p v-if="room.description" class="text-sm text-muted mb-3" style="line-height:1.5">{{ room.description }}</p>
          <div v-if="room.tags" class="flex gap-1 mb-3" style="flex-wrap:wrap">
            <span v-for="tag in room.tags.split(',').map(t=>t.trim()).filter(Boolean)" :key="tag"
              style="font-size:.7rem;padding:.15rem .6rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-full);color:var(--muted)">
              {{ tag }}
            </span>
          </div>
          <div class="flex justify-between items-center" style="border-top:1px solid var(--border);padding-top:.85rem">
            <div class="flex gap-1 items-center">
              <div v-for="m in room.members.slice(0,4)" :key="m.name" class="mini-av" :style="`background:${mColor(m.name)}`" :title="m.name">{{ m.name[0] }}</div>
              <span v-if="room.members.length > 4" class="text-sm text-muted" style="margin-left:.3rem">+{{ room.members.length-4 }}</span>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-primary btn-sm" @click="enterRoom(room)"
                :disabled="!isMember(room) && room.members.length >= room.maxMembers">
                {{ isMember(room) ? 'Open' : room.members.length >= room.maxMembers ? 'Full' : 'Join' }}
              </button>
              <button v-if="room.createdBy===me.name" class="btn btn-outline btn-sm" style="color:var(--error)" @click="deleteRoom(room.id)"><Trash2 :size="13"/></button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════ ACTIVE ROOM VIEW ══════════════════ -->
    <template v-else>
      <!-- Room Header -->
      <div class="room-header">
        <button class="btn btn-outline btn-sm" @click="activeRoom=null" style="flex-shrink:0">
          <ChevronLeft :size="16"/> Back
        </button>
        <div style="flex:1">
          <div class="flex items-center gap-2">
            <h2 style="margin:0;font-size:1.4rem">{{ activeRoom.name }}</h2>
            <span style="font-size:.7rem;padding:.15rem .5rem;border-radius:var(--r-full);background:rgba(123,138,124,.15);color:var(--primary);font-weight:600">
              {{ activeRoom.subject }}
            </span>
          </div>
          <p class="text-sm text-muted" v-if="activeRoom.goal">🎯 {{ activeRoom.goal }}</p>
        </div>
        <div class="flex gap-2 items-center">
          <!-- Invite code -->
          <div class="code-chip" @click="copyCode(activeRoom.code)" title="Click to copy invite code">
            <span style="font-size:.62rem;color:var(--muted)">Invite Code</span>
            <span style="font-weight:700;letter-spacing:.12em;font-size:.95rem;color:var(--primary)">{{ activeRoom.code }}</span>
          </div>
          <button class="btn btn-outline btn-sm" style="color:var(--error)" @click="leaveRoom">Leave</button>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar mb-4">
        <button v-for="tab in tabs" :key="tab.key"
          class="tab-btn" :class="{active: activeTab===tab.key}"
          @click="activeTab=tab.key">
          <component :is="tab.icon" :size="15"/>
          {{ tab.label }}
          <span v-if="tab.key==='announcements' && unreadAnnouncements" class="notif-dot">{{ unreadAnnouncements }}</span>
        </button>
      </div>

      <!-- ── TAB: CHAT ── -->
      <div v-if="activeTab==='chat'" class="tab-content">
        <div class="chat-layout">
          <!-- Chat Area -->
          <div class="chat-main">
            <div class="chat-messages" ref="chatBox">
              <div v-for="msg in activeRoom.messages" :key="msg.id" class="msg-row" :class="msg.sender===me.name?'mine':'theirs'">
                <div v-if="msg.sender!==me.name" class="chat-av" :style="`background:${mColor(msg.sender)}`">{{ msg.sender[0] }}</div>
                <div>
                  <p v-if="msg.sender!==me.name" style="font-size:.65rem;font-weight:600;color:var(--muted);margin-bottom:.15rem">{{ msg.sender }}</p>
                  <div class="bubble" :class="msg.sender===me.name?'b-mine':'b-theirs'">
                    <!-- Link type -->
                    <div v-if="msg.type==='link'" class="link-preview">
                      <Link2 :size="14" style="flex-shrink:0;color:currentColor"/>
                      <div>
                        <p style="font-weight:600;font-size:.8rem;margin:0">Shared Link</p>
                        <a :href="msg.text" target="_blank" style="font-size:.78rem;word-break:break-all;color:inherit;text-decoration:underline">{{ msg.text }}</a>
                      </div>
                    </div>
                    <!-- File / Attachment type -->
                    <div v-else-if="msg.type==='file'" style="display:flex;align-items:center;gap:.65rem;background:rgba(0,0,0,0.05);padding:.5rem .75rem;border-radius:.4rem">
                      <span style="font-size:1.4rem;line-height:1">{{ msg.fileIcon || '📁' }}</span>
                      <div style="flex:1;min-width:0">
                        <p style="font-weight:600;font-size:.82rem;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ msg.text }}</p>
                        <p style="font-size:.68rem;opacity:0.8;margin:0">{{ msg.fileSize || '1.2 MB' }} · {{ msg.fileType || 'Document' }}</p>
                      </div>
                    </div>
                    <!-- Note type -->
                    <div v-else-if="msg.type==='note'" style="background:rgba(191,165,136,.1);border-left:3px solid var(--secondary);padding:.5rem .75rem;border-radius:.4rem">
                      <p style="font-size:.65rem;font-weight:600;color:var(--secondary);margin-bottom:.2rem">📝 Study Note</p>
                      <p style="margin:0;font-size:.85rem;white-space:pre-wrap">{{ msg.text }}</p>
                    </div>
                    <!-- Normal text -->
                    <p v-else style="margin:0;font-size:.875rem;white-space:pre-wrap">{{ msg.text }}</p>
                    <p style="font-size:.6rem;opacity:0.75;margin:.2rem 0 0;text-align:right">{{ msg.time }}</p>
                  </div>
                </div>
              </div>
              <p v-if="!activeRoom.messages.length" style="text-align:center;color:var(--muted);font-size:.875rem;padding:2rem 0">No messages yet. Break the ice! 👋</p>
            </div>

            <!-- Message Input -->
            <div style="position:relative">
              <!-- Attachment Menu Popup -->
              <div v-if="showAttachments" class="attachment-popup">
                <button type="button" class="attach-opt" @click="sendAttachment('photo')">📷 Share Photo</button>
                <button type="button" class="attach-opt" @click="sendAttachment('pdf')">📄 Share PDF Document</button>
                <button type="button" class="attach-opt" @click="sendAttachment('doc')">📁 Share Word Document</button>
              </div>
            </div>

            <form class="chat-input-row" @submit.prevent="sendMsg" style="align-items:center;position:relative">
              <button type="button" class="btn btn-outline btn-icon" style="border-radius:50%;padding:.5rem;flex-shrink:0" @click="showAttachments = !showAttachments" title="Attach file">
                <Paperclip :size="16" />
              </button>
              <input v-model="chatInput" class="form-input" ref="chatField"
                placeholder="Type a message or paste a link…"
                style="font-size:.875rem;flex:1" />
              <button type="submit" class="btn btn-primary btn-sm" style="flex-shrink:0">Send</button>
            </form>
          </div>

          <!-- Members Sidebar -->
          <div class="members-side">
            <p class="side-title">👥 Members ({{ activeRoom.members.length }}/{{ activeRoom.maxMembers }})</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:.5rem">
              <li v-for="m in activeRoom.members" :key="m.name" class="member-row">
                <div class="chat-av" :style="`background:${mColor(m.name)}`">{{ m.name[0] }}</div>
                <div style="flex:1;min-width:0">
                  <p style="font-weight:600;font-size:.82rem;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    {{ m.name }} {{ m.name===me.name?'(You)':'' }}
                  </p>
                  <p style="font-size:.7rem;color:var(--muted);margin:0">{{ m.role || 'Member' }}</p>
                </div>
                <div class="online-dot" :style="`background:${m.name===me.name?'#4a7c59':'#c8c0b8'}`"></div>
              </li>
            </ul>
            <!-- Streak Badges -->
            <p class="side-title" style="margin-top:1.5rem">🔥 Study Streaks</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:.4rem">
              <li v-for="m in streakList" :key="m.name" class="streak-row">
                <span style="font-size:.8rem;font-weight:500;flex:1">{{ m.name }}</span>
                <span class="streak-badge">🔥 {{ m.streak }}d</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ── TAB: TASKS ── -->
      <div v-if="activeTab==='tasks'" class="tab-content">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 style="margin:0">Shared Group Tasks</h3>
            <p class="text-sm text-muted">{{ doneTasks }}/{{ activeRoom.tasks.length }} completed</p>
          </div>
          <button class="btn btn-primary btn-sm" @click="showTaskForm=!showTaskForm"><Plus :size="15"/> Add Task</button>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar mb-4" style="height:10px">
          <div class="progress-fill" :style="`width:${taskProgress}%`"></div>
        </div>

        <!-- Task Form -->
        <Transition name="panel">
          <div v-if="showTaskForm" class="dashed-card mb-4" style="padding:1.25rem">
            <form @submit.prevent="addTask" style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
              <div class="form-group">
                <label class="form-label">Task</label>
                <input v-model="tf.text" type="text" class="form-input" placeholder="Summarise Chapter 6" />
              </div>
              <div class="form-group">
                <label class="form-label">Assign To</label>
                <select v-model="tf.assignee" class="form-input">
                  <option value="">Anyone</option>
                  <option v-for="m in activeRoom.members" :key="m.name" :value="m.name">{{ m.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Due Date</label>
                <input v-model="tf.due" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select v-model="tf.priority" class="form-input">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div class="flex gap-2 justify-end" style="grid-column:span 2">
                <button type="button" class="btn btn-outline btn-sm" @click="showTaskForm=false">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm">Add Task</button>
              </div>
            </form>
          </div>
        </Transition>

        <div v-if="!activeRoom.tasks.length" class="card" style="text-align:center;padding:3rem;color:var(--muted)">
          <CheckSquare :size="40" style="margin:0 auto 1rem;opacity:.2"/>
          <p>No tasks yet. Add the first shared goal!</p>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:.65rem">
          <div v-for="task in activeRoom.tasks" :key="task.id" class="task-row card"
            :style="`border-left:4px solid ${pCol(task.priority)};padding:1rem 1.25rem;opacity:${task.done ? 0.65 : 1}`">
            <input type="checkbox" :checked="task.done" @change="toggleTask(task.id)"
              style="accent-color:var(--primary);width:16px;height:16px;cursor:pointer;flex-shrink:0" />
            <div style="flex:1">
              <p style="font-weight:600;font-size:.95rem;margin:0" :style="task.done?'text-decoration:line-through;color:var(--muted)':''">{{ task.text }}</p>
              <div class="flex gap-3 text-sm text-muted mt-1" style="flex-wrap:wrap">
                <span v-if="task.assignee">👤 {{ task.assignee }}</span>
                <span v-if="task.due">📅 {{ task.due }}</span>
                <span>Added by {{ task.addedBy }}</span>
              </div>
            </div>
            <span class="badge" :style="`background:${pCol(task.priority)}18;color:${pCol(task.priority)}`">{{ task.priority }}</span>
            <button @click="removeTask(task.id)" style="color:var(--muted);font-size:1.1rem">×</button>
          </div>
        </div>
      </div>

      <!-- ── TAB: CALENDAR ── -->
      <div v-if="activeTab==='calendar'" class="tab-content">
        <div class="flex justify-between items-center mb-4">
          <h3 style="margin:0">Group Calendar</h3>
          <button class="btn btn-primary btn-sm" @click="showEventForm=!showEventForm"><Plus :size="15"/> Add Event</button>
        </div>

        <Transition name="panel">
          <div v-if="showEventForm" class="dashed-card mb-4" style="padding:1.25rem">
            <form @submit.prevent="addEvent" style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
              <div class="form-group">
                <label class="form-label">Event Title</label>
                <input v-model="ef.title" type="text" class="form-input" placeholder="Exam Revision Session" />
              </div>
              <div class="form-group">
                <label class="form-label">Type</label>
                <select v-model="ef.type" class="form-input">
                  <option>Study Session</option><option>Exam</option><option>Assignment Due</option><option>Deadline</option><option>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input v-model="ef.date" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Time</label>
                <input v-model="ef.time" type="time" class="form-input" />
              </div>
              <div class="form-group" style="grid-column:span 2">
                <label class="form-label">Notes</label>
                <input v-model="ef.notes" type="text" class="form-input" placeholder="Additional details…" />
              </div>
              <div class="flex gap-2 justify-end" style="grid-column:span 2">
                <button type="button" class="btn btn-outline btn-sm" @click="showEventForm=false">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm">Add to Calendar</button>
              </div>
            </form>
          </div>
        </Transition>

        <div v-if="!activeRoom.events.length" class="card" style="text-align:center;padding:3rem;color:var(--muted)">
          <CalendarDays :size="40" style="margin:0 auto 1rem;opacity:.2"/>
          <p>No events scheduled. Add study sessions, exams, and deadlines!</p>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:.65rem">
          <div v-for="ev in sortedEvents" :key="ev.id" class="card" style="padding:1rem 1.25rem;display:flex;gap:1rem;align-items:center">
            <div style="text-align:center;min-width:52px;padding:.4rem;border-radius:var(--r-sm)" :style="`background:${evColor(ev.type)}18`">
              <p style="font-size:1.1rem;margin:0">{{ evEmoji(ev.type) }}</p>
              <p style="font-size:.62rem;color:var(--muted);margin:0;font-weight:600">{{ evShortDate(ev.date) }}</p>
            </div>
            <div style="flex:1">
              <p style="font-weight:600;font-size:.95rem;margin:0">{{ ev.title }}</p>
              <div class="flex gap-3 text-sm text-muted mt-1">
                <span>{{ ev.date }}{{ ev.time ? ' at '+ev.time : '' }}</span>
                <span v-if="ev.notes">· {{ ev.notes }}</span>
              </div>
            </div>
            <span class="badge" :style="`background:${evColor(ev.type)}18;color:${evColor(ev.type)}`">{{ ev.type }}</span>
            <span style="font-size:.78rem;font-weight:600" :style="`color:${daysUntil(ev.date)<=3?'var(--error)':'var(--muted)'}`">
              {{ daysUntil(ev.date) === 0 ? 'Today!' : daysUntil(ev.date) < 0 ? 'Past' : daysUntil(ev.date)+'d away' }}
            </span>
            <button @click="removeEvent(ev.id)" style="color:var(--muted);font-size:1.1rem">×</button>
          </div>
        </div>
      </div>

      <!-- ── TAB: TIMER ── -->
      <div v-if="activeTab==='timer'" class="tab-content" style="display:flex;flex-direction:column;align-items:center">
        <h3 style="margin-bottom:.5rem">Group Focus Timer</h3>
        <p class="text-sm text-muted mb-4">Sync your study session with the group. Everyone studies together! ⏱️</p>

        <!-- Mode selector -->
        <div class="flex gap-2 mb-6" style="background:rgba(255,255,255,.7);border:1px solid var(--border);border-radius:var(--r-full);padding:.4rem">
          <button v-for="m in timerModes" :key="m.key" class="mode-btn" :class="{active:gTimerMode===m.key}"
            :style="gTimerMode===m.key?`color:${m.color}`:``" @click="changeTimerMode(m.key)">
            {{ m.emoji }} {{ m.label }}
          </button>
        </div>

        <!-- SVG Ring -->
        <div style="position:relative;margin-bottom:2rem">
          <svg width="240" height="240" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="104" fill="none" stroke="var(--border)" stroke-width="8"/>
            <circle cx="120" cy="120" r="104" fill="none"
              :stroke="activeTimerMode.color" stroke-width="8" stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="timerOffset"
              transform="rotate(-90 120 120)"
              style="transition:stroke-dashoffset 1s linear"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <span style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:700;line-height:1">{{ fmtTime(gTimeLeft) }}</span>
            <span style="font-size:.8rem;color:var(--muted);margin-top:.35rem">{{ activeTimerMode.label }}</span>
          </div>
        </div>

        <div class="flex gap-3 mb-6">
          <button class="btn btn-primary" style="padding:.85rem 2.5rem;border-radius:var(--r-full)" @click="toggleGTimer">
            <component :is="gTimerActive ? PauseIcon : PlayIcon" :size="20"/>
            {{ gTimerActive ? 'Pause' : 'Start' }}
          </button>
          <button class="btn btn-outline" style="padding:.85rem;border-radius:var(--r-full)" @click="resetGTimer"><RotateCcw :size="20"/></button>
        </div>

        <!-- Who's studying -->
        <div class="card" style="width:100%;max-width:480px;padding:1.25rem">
          <p style="font-weight:600;margin-bottom:.75rem">Currently Studying</p>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem">
            <div v-for="m in activeRoom.members" :key="m.name" class="studying-chip"
              :style="gTimerActive?'opacity:1':'opacity:.4'">
              <div class="chat-av" style="width:22px;height:22px;font-size:.65rem" :style="`background:${mColor(m.name)}`">{{ m.name[0] }}</div>
              <span style="font-size:.8rem">{{ m.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB: FILES ── -->
      <div v-if="activeTab==='files'" class="tab-content">
        <div class="flex justify-between items-center mb-4">
          <h3 style="margin:0">Shared Materials</h3>
          <button class="btn btn-primary btn-sm" @click="showFileForm=!showFileForm"><Plus :size="15"/> Share</button>
        </div>
        <Transition name="panel">
          <div v-if="showFileForm" class="dashed-card mb-4" style="padding:1.25rem">
            <form @submit.prevent="shareFile" style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
              <div class="form-group">
                <label class="form-label">Title</label>
                <input v-model="ff.title" type="text" class="form-input" placeholder="Chapter 5 Notes" />
              </div>
              <div class="form-group">
                <label class="form-label">Type</label>
                <select v-model="ff.type" class="form-input">
                  <option>📄 Notes</option><option>🔗 Link</option><option>📊 Presentation</option><option>📁 Document</option><option>🎥 Video</option>
                </select>
              </div>
              <div class="form-group" style="grid-column:span 2">
                <label class="form-label">URL / Description</label>
                <input v-model="ff.url" type="text" class="form-input" placeholder="Paste a URL or describe the resource" />
              </div>
              <div class="flex gap-2 justify-end" style="grid-column:span 2">
                <button type="button" class="btn btn-outline btn-sm" @click="showFileForm=false">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm">Share</button>
              </div>
            </form>
          </div>
        </Transition>
        <div v-if="!activeRoom.files.length" class="card" style="text-align:center;padding:3rem;color:var(--muted)">
          <BookOpen :size="40" style="margin:0 auto 1rem;opacity:.2"/>
          <p>No shared materials yet. Share notes, links, and resources!</p>
        </div>
        <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">
          <div v-for="f in activeRoom.files" :key="f.id" class="card file-card">
            <div class="flex justify-between items-start mb-2">
              <span style="font-size:1.75rem">{{ f.type.split(' ')[0] }}</span>
              <button @click="removeFile(f.id)" style="color:var(--muted);font-size:1.1rem">×</button>
            </div>
            <h4 style="margin:0 0 .25rem;font-size:.95rem">{{ f.title }}</h4>
            <p class="text-sm text-muted mb-2">{{ f.type.split(' ').slice(1).join(' ') }}</p>
            <p v-if="f.url" class="text-sm" style="word-break:break-all;color:var(--secondary)">{{ f.url }}</p>
            <p style="font-size:.65rem;color:var(--muted);margin-top:.75rem">Shared by {{ f.sharedBy }} · {{ f.date }}</p>
          </div>
        </div>
      </div>

      <!-- ── TAB: ANNOUNCEMENTS ── -->
      <div v-if="activeTab==='announcements'" class="tab-content">
        <div class="flex justify-between items-center mb-4">
          <h3 style="margin:0">Announcements</h3>
          <button v-if="isAdmin" class="btn btn-primary btn-sm" @click="showAnnForm=!showAnnForm"><Plus :size="15"/> Post</button>
        </div>
        <Transition name="panel">
          <div v-if="showAnnForm && isAdmin" class="dashed-card mb-4" style="padding:1.25rem">
            <form @submit.prevent="postAnn">
              <div class="form-group">
                <label class="form-label">Announcement</label>
                <textarea v-model="annInput" class="form-input" rows="3" placeholder="Important update for the group…"></textarea>
              </div>
              <div class="flex gap-2 justify-end">
                <button type="button" class="btn btn-outline btn-sm" @click="showAnnForm=false">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm">Post Announcement</button>
              </div>
            </form>
          </div>
        </Transition>
        <div v-if="!activeRoom.announcements.length" class="card" style="text-align:center;padding:3rem;color:var(--muted)">
          <Bell :size="40" style="margin:0 auto 1rem;opacity:.2"/>
          <p>No announcements yet.{{ isAdmin ? ' Post the first one!' : '' }}</p>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:.75rem">
          <div v-for="ann in [...activeRoom.announcements].reverse()" :key="ann.id"
            class="card" style="padding:1.25rem;border-left:4px solid var(--secondary)">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <div class="chat-av" :style="`background:${mColor(ann.author)}`">{{ ann.author[0] }}</div>
                <div>
                  <p style="font-weight:600;font-size:.875rem;margin:0">{{ ann.author }}</p>
                  <p style="font-size:.68rem;color:var(--muted);margin:0">{{ ann.date }}</p>
                </div>
              </div>
              <button v-if="isAdmin" @click="removeAnn(ann.id)" style="color:var(--muted)">×</button>
            </div>
            <p style="font-size:.9rem;line-height:1.6;white-space:pre-wrap">{{ ann.text }}</p>
          </div>
        </div>
      </div>

      <!-- ── TAB: PROGRESS ── -->
      <div v-if="activeTab==='progress'" class="tab-content">
        <h3 style="margin-bottom:1.5rem">Group Progress Dashboard</h3>

        <!-- Group stats -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem">
          <div v-for="s in groupStats" :key="s.label" class="card" style="padding:1.25rem;text-align:center">
            <p style="font-size:2rem;margin:0;font-family:'Playfair Display',serif;font-weight:700" :style="`color:${s.color}`">{{ s.value }}</p>
            <p class="text-sm text-muted mt-1">{{ s.label }}</p>
          </div>
        </div>

        <!-- Per-member progress -->
        <h4 style="margin-bottom:1rem">Member Participation</h4>
        <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem">
          <div v-for="m in memberStats" :key="m.name" class="card" style="padding:1rem 1.25rem">
            <div class="flex items-center gap-3 mb-2">
              <div class="chat-av" :style="`background:${mColor(m.name)}`">{{ m.name[0] }}</div>
              <div style="flex:1">
                <div class="flex justify-between items-center">
                  <p style="font-weight:600;font-size:.9rem;margin:0">{{ m.name }} {{ m.name===me.name?'(You)':'' }}</p>
                  <div class="flex gap-2 items-center">
                    <span class="streak-badge">🔥 {{ m.streak }}d streak</span>
                    <span style="font-size:.78rem;font-weight:600;color:var(--primary)">{{ m.tasksDone }} tasks done</span>
                  </div>
                </div>
                <div class="progress-bar mt-2">
                  <div class="progress-fill" :style="`width:${m.progress}%;background:${mColor(m.name)}`"></div>
                </div>
              </div>
            </div>
            <div class="flex gap-4 text-sm text-muted">
              <span>💬 {{ m.messages }} messages</span>
              <span>📋 {{ m.tasksDone }}/{{ m.tasksAssigned }} tasks</span>
              <span>🔥 {{ m.streak }} day streak</span>
            </div>
          </div>
        </div>

        <!-- Activity log -->
        <h4 style="margin-bottom:1rem">Recent Activity</h4>
        <div v-if="!activeRoom.activity.length" class="card" style="text-align:center;padding:2rem;color:var(--muted)">
          <p>No activity yet.</p>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:.4rem">
          <div v-for="act in [...activeRoom.activity].reverse().slice(0,15)" :key="act.id"
            class="card" style="padding:.65rem 1rem;display:flex;gap:.75rem;align-items:center">
            <span style="font-size:1rem">{{ act.emoji }}</span>
            <span class="text-sm" style="flex:1">{{ act.text }}</span>
            <span style="font-size:.68rem;color:var(--muted)">{{ act.time }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import {
  Plus, Users, Trash2, ChevronLeft, Link2, CheckSquare,
  CalendarDays, BookOpen, Bell, Play as PlayIcon, Pause as PauseIcon, RotateCcw,
  MessageSquare, Clock, TrendingUp, Paperclip
} from '@lucide/vue'
import { useToast } from '../composables/useToast'
import confetti from 'canvas-confetti'

const toast = useToast()
const me    = JSON.parse(localStorage.getItem('study_planner_user') || '{}')

import api from '../api'
import { onMounted } from 'vue'

// ─── Rooms Storage ───
const rooms      = ref([])
const activeRoom = ref(null)

onMounted(async () => {
  try {
    const res = await api.get('/rooms')
    rooms.value = res.data
  } catch (err) {}
})

const saveRooms = async () => {
  if (activeRoom.value && (activeRoom.value._id || activeRoom.value.id)) {
    try {
      const id = activeRoom.value._id || activeRoom.value.id
      await api.put(`/rooms/${id}`, activeRoom.value)
    } catch (err) {}
  }
}

// ─── UI State ───
const listFilter    = ref('all')
const showCreateForm = ref(false)
const activeTab     = ref('chat')
const joinCode      = ref('')
const chatBox       = ref(null)
const chatField     = ref(null)
const showAttachments = ref(false)

// Form models
const nf = reactive({ name:'', subject:'', goal:'', description:'', tags:'', visibility:'public', maxMembers:4 })
const fe = reactive({ name:'', subject:'' })
const tf = reactive({ text:'', assignee:'', due:'', priority:'Medium' })
const ef = reactive({ title:'', type:'Study Session', date:'', time:'', notes:'' })
const ff = reactive({ title:'', type:'📄 Notes', url:'' })
const annInput = ref('')
const chatInput = ref('')
const msgType   = ref('text')
const groupTaskInput = ref('')

const showTaskForm  = ref(false)
const showEventForm = ref(false)
const showFileForm  = ref(false)
const showAnnForm   = ref(false)

// ─── Tabs ───
const tabs = [
  { key:'chat',          label:'Chat',          icon: MessageSquare },
  { key:'tasks',         label:'Tasks',          icon: CheckSquare },
  { key:'calendar',      label:'Calendar',       icon: CalendarDays },
  { key:'timer',         label:'Focus Timer',    icon: Clock },
  { key:'files',         label:'Materials',      icon: BookOpen },
  { key:'announcements', label:'Announcements',  icon: Bell },
  { key:'progress',      label:'Progress',       icon: TrendingUp },
]

// ─── Group Timer ───
const timerModes = [
  { key:'study',      label:'Study',       emoji:'📚', color:'var(--primary)',   mins:25 },
  { key:'shortBreak', label:'Short Break', emoji:'☕', color:'var(--secondary)', mins:5  },
  { key:'longBreak',  label:'Long Break',  emoji:'🌿', color:'#9b7ea6',          mins:15 },
]
const gTimerMode   = ref('study')
const gTimeLeft    = ref(25 * 60)
const gTimerActive = ref(false)
let gInterval = null

const activeTimerMode = computed(() => timerModes.find(m => m.key === gTimerMode.value))
const circumference   = 2 * Math.PI * 104
const gTotal          = computed(() => activeTimerMode.value.mins * 60)
const timerOffset     = computed(() => circumference - ((gTotal.value - gTimeLeft.value) / gTotal.value) * circumference)

function changeTimerMode(key) {
  gTimerMode.value   = key
  gTimerActive.value = false
  clearInterval(gInterval)
  gTimeLeft.value = timerModes.find(m => m.key === key).mins * 60
}
function toggleGTimer() {
  if (gTimerActive.value) { gTimerActive.value = false; clearInterval(gInterval) }
  else {
    gTimerActive.value = true
    gInterval = setInterval(() => {
      if (gTimeLeft.value > 0) gTimeLeft.value--
      else { gTimerActive.value = false; clearInterval(gInterval); toast.success('⏰ Session complete! Time for a break.') }
    }, 1000)
    logActivity(`${me.name} started a ${activeTimerMode.value.label} timer.`, '⏱️')
  }
}
function resetGTimer() {
  gTimerActive.value = false; clearInterval(gInterval)
  gTimeLeft.value = activeTimerMode.value.mins * 60
}
function fmtTime(s) { return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}` }

// ─── Helpers ───
const COLORS = ['#7b8a7c','#bfa588','#9b7ea6','#6a8faf','#c89a6e','#cc6c6c','#b5a36e','#6ab8a0']
function hue(str) { return [...str].reduce((a,c) => a + c.charCodeAt(0), 0) }
function sColor(s='') { return COLORS[hue(s) % COLORS.length] }
function mColor(n='') { return COLORS[hue(n) % COLORS.length] }
function pCol(p) { return p==='High'?'#cc6c6c':p==='Medium'?'#c89a6e':'#7b8a7c' }
function isMember(room) { return room.members.some(m => m.name === me.name) }
function genCode() { return Math.random().toString(36).substring(2,8).toUpperCase() }

function evColor(t) {
  return t==='Exam'?'#cc6c6c':t==='Study Session'?'#7b8a7c':t==='Assignment Due'?'#c89a6e':'#9b7ea6'
}
function evEmoji(t) {
  return t==='Exam'?'🎯':t==='Study Session'?'📚':t==='Assignment Due'?'📝':t==='Deadline'?'⚠️':'📌'
}
function evShortDate(d) { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) }
function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000) }

const isAdmin = computed(() => activeRoom.value?.createdBy === me.name)
const unreadAnnouncements = computed(() => {
  if (!activeRoom.value || activeTab.value === 'announcements') return 0
  return activeRoom.value.announcements.length
})

function logActivity(text, emoji='📌') {
  if (!activeRoom.value) return
  activeRoom.value.activity.push({
    id: Date.now(), text, emoji,
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  })
  saveRooms()
}

// ─── Room Actions ───
const filteredRooms = computed(() => rooms.value.filter(r => {
  if (listFilter.value === 'public')  return r.visibility === 'public'
  if (listFilter.value === 'private') return r.visibility === 'private'
  if (listFilter.value === 'mine')    return isMember(r)
  return true
}))

async function createRoom() {
  fe.name = fe.subject = ''
  let ok = true
  if (!nf.name.trim())    { fe.name = 'Group name is required'; ok = false }
  if (!nf.subject.trim()) { fe.subject = 'Subject is required'; ok = false }
  if (!ok) return

  const roomPayload = {
    code: genCode(),
    name: nf.name.trim(), subject: nf.subject.trim(),
    goal: nf.goal.trim(), description: nf.description.trim(),
    tags: nf.tags.trim(), visibility: nf.visibility,
    maxMembers: nf.maxMembers, createdBy: me.name,
    members: [{ name: me.name, role: 'Admin', streak: 1 }],
    messages: [], tasks: [], events: [], files: [], announcements: [], activity: [],
  }
  
  try {
    const res = await api.post('/rooms', roomPayload)
    const room = res.data
    rooms.value.unshift(room)
    Object.assign(nf, { name:'', subject:'', goal:'', description:'', tags:'', visibility:'public', maxMembers:4 })
    showCreateForm.value = false
    activeRoom.value = room
    logActivity(`${me.name} created the group.`, '🎉')
    toast.success(`Group created! Invite code: ${room.code} 🎉`)
  } catch (err) {
    toast.error('Failed to create group')
  }
}

function enterRoom(room) {
  if (!isMember(room)) {
    if (room.members.length >= room.maxMembers) { toast.error('Room is full!'); return }
    room.members.push({ name: me.name, role: 'Member', streak: 1 })
    saveRooms()
    logActivity(`${me.name} joined the group.`, '👋')
  }
  activeRoom.value = room
  activeTab.value = 'chat'
  toast.success(`Joined "${room.name}"!`)
  
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

function joinByCode() {
  const code = joinCode.value.trim().toUpperCase()
  if (!code) { toast.error('Enter a code first'); return }
  const room = rooms.value.find(r => r.code === code)
  if (!room) { toast.error('No room found with that code'); return }
  
  if (isMember(room)) {
    toast.error('You are already a member of this study group! Opening it instead.')
    activeRoom.value = room
    activeTab.value = 'chat'
    joinCode.value = ''
    return
  }
  
  enterRoom(room); joinCode.value = ''
}

function leaveRoom() {
  toast.info(`Left "${activeRoom.value.name}"`)
  activeRoom.value = null; resetGTimer()
}

async function deleteRoom(id) {
  try {
    await api.delete(`/rooms/${id}`)
    rooms.value = rooms.value.filter(r => r._id !== id && r.id !== id)
    if (activeRoom.value && (activeRoom.value._id === id || activeRoom.value.id === id)) { 
      activeRoom.value = null; 
      resetGTimer() 
    }
    toast.info('Group deleted')
  } catch(err) {
    toast.error('Failed to delete group')
  }
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => toast.success('Invite code copied! 📋'))
}

// ─── Chat ───
watch(() => activeRoom.value?.messages, async () => {
  await nextTick()
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
}, { deep: true })

async function sendMsg() {
  if (!chatInput.value.trim() || !activeRoom.value) return
  const text = chatInput.value.trim()
  
  // URL detection
  const isUrl = /^(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(text)
  const type = isUrl ? 'link' : 'text'
  
  activeRoom.value.messages.push({
    id: Date.now(), sender: me.name, type,
    text,
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  })
  chatInput.value = ''
  saveRooms()
  await nextTick()
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
}

function sendAttachment(fileType) {
  showAttachments.value = false
  let defaultName = ''
  let icon = '📁'
  let size = '1.4 MB'
  
  if (fileType === 'photo') {
    defaultName = 'Notes_Screenshot.png'
    icon = '📷'
    size = '2.1 MB'
  } else if (fileType === 'pdf') {
    defaultName = 'Chapter_7_Study_Guide.pdf'
    icon = '📄'
    size = '4.5 MB'
  } else if (fileType === 'doc') {
    defaultName = 'Project_Draft.docx'
    icon = '📝'
    size = '840 KB'
  }
  
  const fileName = prompt(`Enter name of the ${fileType} to share:`, defaultName)
  if (!fileName) return
  
  activeRoom.value.messages.push({
    id: Date.now(),
    sender: me.name,
    type: 'file',
    text: fileName,
    fileIcon: icon,
    fileSize: size,
    fileType: fileType.toUpperCase(),
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  })
  saveRooms()
  logActivity(`${me.name} shared a file: "${fileName}"`, icon)
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

// ─── Tasks ───
const doneTasks    = computed(() => activeRoom.value?.tasks.filter(t => t.done).length || 0)
const taskProgress = computed(() => activeRoom.value?.tasks.length ? Math.round(doneTasks.value / activeRoom.value.tasks.length * 100) : 0)

function addTask() {
  if (!tf.text.trim()) return
  activeRoom.value.tasks.push({
    id: Date.now(), text: tf.text.trim(), assignee: tf.assignee,
    due: tf.due, priority: tf.priority, done: false, addedBy: me.name
  })
  logActivity(`${me.name} added task: "${tf.text}"`, '📋')
  Object.assign(tf, { text:'', assignee:'', due:'', priority:'Medium' })
  showTaskForm.value = false; saveRooms()
  toast.success('Task added!')
}
function toggleTask(id) {
  const t = activeRoom.value.tasks.find(x => x.id === id)
  if (!t) return
  t.done = !t.done
  if (t.done) {
    confetti({ particleCount:60, spread:50, origin:{y:.7}, colors:['#7b8a7c','#bfa588'] })
    logActivity(`${me.name} completed: "${t.text}"`, '✅')
    toast.success('Task completed! 🎉')
  }
  saveRooms()
}
function removeTask(id) { activeRoom.value.tasks = activeRoom.value.tasks.filter(t => t.id !== id); saveRooms() }

// ─── Calendar ───
const sortedEvents = computed(() => [...(activeRoom.value?.events||[])].sort((a,b) => new Date(a.date)-new Date(b.date)))
function addEvent() {
  if (!ef.title.trim() || !ef.date) { toast.error('Title and date required'); return }
  activeRoom.value.events.push({ id: Date.now(), ...ef })
  logActivity(`${me.name} added event: "${ef.title}" on ${ef.date}`, '📅')
  Object.assign(ef, { title:'', type:'Study Session', date:'', time:'', notes:'' })
  showEventForm.value = false; saveRooms(); toast.success('Event added to calendar!')
}
function removeEvent(id) { activeRoom.value.events = activeRoom.value.events.filter(e => e.id !== id); saveRooms() }

// ─── Files ───
function shareFile() {
  if (!ff.title.trim()) { toast.error('Title required'); return }
  activeRoom.value.files.push({
    id: Date.now(), ...ff, sharedBy: me.name,
    date: new Date().toLocaleDateString()
  })
  logActivity(`${me.name} shared "${ff.title}"`, '📎')
  Object.assign(ff, { title:'', type:'📄 Notes', url:'' })
  showFileForm.value = false; saveRooms(); toast.success('Resource shared!')
}
function removeFile(id) { activeRoom.value.files = activeRoom.value.files.filter(f => f.id !== id); saveRooms() }

// ─── Announcements ───
function postAnn() {
  if (!annInput.value.trim()) return
  activeRoom.value.announcements.push({
    id: Date.now(), author: me.name, text: annInput.value.trim(),
    date: new Date().toLocaleString()
  })
  logActivity(`${me.name} posted an announcement`, '📢')
  annInput.value = ''; showAnnForm.value = false; saveRooms()
  toast.success('Announcement posted!')
}
function removeAnn(id) { activeRoom.value.announcements = activeRoom.value.announcements.filter(a => a.id !== id); saveRooms() }

// ─── Progress ───
const groupStats = computed(() => {
  if (!activeRoom.value) return []
  const total   = activeRoom.value.tasks.length
  const done    = activeRoom.value.tasks.filter(t => t.done).length
  const msgs    = activeRoom.value.messages.length
  const events  = activeRoom.value.events.length
  return [
    { label:'Tasks Completed', value: `${done}/${total}`, color:'#7b8a7c' },
    { label:'Messages Sent',   value: msgs,               color:'#bfa588' },
    { label:'Events Scheduled',value: events,             color:'#9b7ea6' },
    { label:'Members',         value: activeRoom.value.members.length, color:'#6a8faf' },
  ]
})

const memberStats = computed(() => {
  if (!activeRoom.value) return []
  return activeRoom.value.members.map(m => {
    const msgs   = activeRoom.value.messages.filter(x => x.sender === m.name).length
    const all    = activeRoom.value.tasks.filter(t => t.assignee === m.name || t.assignee === '')
    const done   = all.filter(t => t.done).length
    const streak = m.streak || 1
    return { name:m.name, messages:msgs, tasksAssigned:all.length, tasksDone:done,
             streak, progress: all.length ? Math.round(done/all.length*100) : 0 }
  })
})

const streakList = computed(() => activeRoom.value?.members.map(m => ({ name:m.name, streak:m.streak||1 }))
  .sort((a,b) => b.streak-a.streak) || [])
</script>

<style scoped>
.mb-4 { margin-bottom:1rem; }
.mb-6 { margin-bottom:1.5rem; }

/* Room card */
.room-card { padding:1.5rem; transition:transform .2s; cursor:pointer; }
.room-card:hover { transform:translateY(-2px); }
.mini-av { width:26px;height:26px;border-radius:50%;color:#fff;font-weight:700;font-size:.72rem;display:flex;align-items:center;justify-content:center;border:2px solid var(--surface); }

/* Room header */
.room-header { display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding:1.25rem 1.5rem;background:linear-gradient(135deg,#f5ede0,#ece5d8);border-radius:var(--r-lg);flex-wrap:wrap; }
.code-chip { background:var(--surface);border:1.5px solid var(--primary);border-radius:var(--r-sm);padding:.4rem .85rem;cursor:pointer;text-align:center;display:flex;flex-direction:column;gap:.1rem; }
.code-chip:hover { box-shadow:var(--shadow-sm); }

/* Tab bar */
.tab-bar { display:flex;gap:.25rem;background:var(--bg);border:1px solid var(--border);padding:.4rem;border-radius:var(--r-full);flex-wrap:wrap; }
.tab-btn { padding:.5rem 1rem;border-radius:var(--r-full);font-size:.8rem;font-weight:500;color:var(--muted);display:flex;align-items:center;gap:.35rem;transition:all .2s;position:relative; }
.tab-btn:hover { color:var(--primary);background:rgba(123,138,124,.06); }
.tab-btn.active { background:var(--surface);color:var(--primary);font-weight:600;box-shadow:var(--shadow-sm); }
.notif-dot { position:absolute;top:2px;right:2px;background:var(--error);color:#fff;font-size:.55rem;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700; }

/* Tab content */
.tab-content { background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:1.5rem;min-height:300px; }

/* Chat layout */
.chat-layout { display:grid;grid-template-columns:1fr 200px;gap:1rem;height:100%; }
.chat-main { display:flex;flex-direction:column;min-height:400px; }
.chat-messages { flex:1;overflow-y:auto;max-height:320px;display:flex;flex-direction:column;gap:.5rem;padding:.25rem 0;margin-bottom:.5rem; }

.msg-row { display:flex;align-items:flex-end;gap:.45rem; }
.msg-row.mine { flex-direction:row-reverse; }
.chat-av { width:28px;height:28px;border-radius:50%;color:#fff;font-weight:700;font-size:.78rem;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.bubble { max-width:75%;padding:.55rem .85rem;border-radius:var(--r-md); }
.b-theirs { background:var(--bg);border:1px solid var(--border);border-bottom-left-radius:.25rem; }
.b-mine   { background:var(--primary);color:#fff;border-bottom-right-radius:.25rem; }
.link-preview { display:flex;gap:.5rem;align-items:flex-start; }

.chat-toolbar { display:flex;gap:.25rem;padding:.25rem 0;margin-bottom:.5rem; }
.tool-btn { padding:.35rem .6rem;border-radius:var(--r-sm);font-size:.85rem;transition:background .15s;border:1px solid transparent; }
.tool-btn:hover,.tool-btn.active { background:var(--bg);border-color:var(--border); }
.chat-input-row { display:flex;gap:.5rem; }

.members-side { border-left:1px solid var(--border);padding-left:1rem; }
.side-title { font-size:.72rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem; }
.member-row { display:flex;align-items:center;gap:.5rem;padding:.35rem 0; }
.online-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
.streak-row { display:flex;align-items:center;padding:.3rem 0; }
.streak-badge { font-size:.7rem;font-weight:700;background:linear-gradient(90deg,#ffb347,#ff6b6b);color:#fff;padding:.15rem .5rem;border-radius:var(--r-full); }

/* Tasks */
.task-row { display:flex;align-items:center;gap:.85rem; }

/* Files */
.file-card { transition:transform .2s; }
.file-card:hover { transform:translateY(-2px); }

/* Timer */
.mode-btn { padding:.55rem 1.1rem;border-radius:var(--r-full);font-weight:600;font-size:.82rem;color:var(--muted);transition:all .2s; }
.mode-btn.active { background:var(--surface);box-shadow:var(--shadow-sm); }
.studying-chip { display:flex;align-items:center;gap:.4rem;padding:.3rem .65rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-full);font-size:.8rem;transition:opacity .4s; }

/* Transitions */
.panel-enter-active,.panel-leave-active { transition:all .25s ease; }
.panel-enter-from,.panel-leave-to { opacity:0;transform:translateY(-8px); }
</style>
