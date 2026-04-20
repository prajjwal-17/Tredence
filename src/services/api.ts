import type { AutomationAction } from '../types/workflow.types';
import type {
  WorkflowDefinition,
  SimulationResult,
  SimulationLog,
} from '../types/execution.types';
import { NodeType } from '../types/workflow.types';

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject'],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient'],
  },
  {
    id: 'send_slack',
    label: 'Send Slack Message',
    params: ['channel', 'message'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    params: ['employeeId', 'field', 'value'],
  },
  {
    id: 'schedule_meeting',
    label: 'Schedule Meeting',
    params: ['participants', 'duration'],
  },
];

// ─── API abstraction ───────────────────────────────────────────────────────

export async function getAutomations(): Promise<AutomationAction[]> {
  // Simulate network delay
  await delay(300);
  return MOCK_AUTOMATIONS;
}

export async function simulateWorkflow(
  definition: WorkflowDefinition
): Promise<SimulationResult> {
  await delay(500);

  if (definition.steps.length === 0) {
    return { success: false, logs: [], errors: ['No steps to simulate'] };
  }

  const logs: SimulationLog[] = [];
  const context: Record<string, unknown> = {};

  // Execute steps in order
  for (const step of definition.steps) {
    const startTime = performance.now();
    await delay(100 + Math.random() * 200); // Simulate processing

    const log = executeStep(step.id, step.type, step.config, context);
    const duration = performance.now() - startTime;

    logs.push({
      ...log,
      duration: Math.round(duration),
      timestamp: new Date().toISOString(),
    });

    if (log.status === 'failed') {
      return {
        success: false,
        logs,
        errors: [`Step "${log.title}" failed: ${log.message}`],
      };
    }
  }

  return { success: true, logs, errors: [] };
}

// ─── Step execution logic ──────────────────────────────────────────────────

function executeStep(
  stepId: string,
  type: NodeType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  context: Record<string, unknown>
): Omit<SimulationLog, 'duration' | 'timestamp'> {
  switch (type) {
    case NodeType.START:
      context['_started'] = true;
      context['_metadata'] = config.metadata ?? {};
      return {
        stepId,
        stepType: type,
        title: config.title ?? 'Start',
        status: 'completed',
        message: `Workflow initiated. Metadata: ${JSON.stringify(config.metadata ?? {})}`,
      };

    case NodeType.TASK: {
      const assignee = config.assignee || 'Unassigned';
      context[stepId] = { assignee, completed: true };
      return {
        stepId,
        stepType: type,
        title: config.title ?? 'Task',
        status: 'completed',
        message: `Task assigned to "${assignee}". ${config.description ? `Description: ${config.description}` : ''}`.trim(),
      };
    }

    case NodeType.APPROVAL: {
      const threshold = config.autoApproveThreshold ?? 0;
      const roll = Math.random() * 100;
      const approved = threshold > 0 && roll < threshold;
      context[stepId] = { approved, approver: config.approverRole };
      return {
        stepId,
        stepType: type,
        title: config.title ?? 'Approval',
        status: approved ? 'completed' : 'pending',
        message: approved
          ? `Auto-approved (threshold: ${threshold}%, roll: ${roll.toFixed(1)}%)`
          : `Awaiting manual approval from "${config.approverRole || 'unspecified role'}"`,
      };
    }

    case NodeType.AUTOMATED: {
      if (!config.actionId) {
        return {
          stepId,
          stepType: type,
          title: config.title ?? 'Automated',
          status: 'failed',
          message: 'No action configured',
        };
      }
      const automation = MOCK_AUTOMATIONS.find((a) => a.id === config.actionId);
      const missingParams = automation?.params.filter(
        (p) => !config.params?.[p]
      );
      if (missingParams && missingParams.length > 0) {
        return {
          stepId,
          stepType: type,
          title: config.title ?? 'Automated',
          status: 'failed',
          message: `Missing required params: ${missingParams.join(', ')}`,
        };
      }
      context[stepId] = { action: config.actionId, params: config.params };
      return {
        stepId,
        stepType: type,
        title: config.title ?? 'Automated',
        status: 'completed',
        message: `Executed "${automation?.label ?? config.actionId}" with params: ${JSON.stringify(config.params ?? {})}`,
      };
    }

    case NodeType.END: {
      const summary = config.summaryFlag
        ? `Workflow complete. Summary: ${JSON.stringify(context)}`
        : 'Workflow complete.';
      return {
        stepId,
        stepType: type,
        title: config.title ?? 'End',
        status: 'completed',
        message: config.message || summary,
      };
    }

    default:
      return {
        stepId,
        stepType: type,
        title: 'Unknown',
        status: 'failed',
        message: `Unknown node type: ${type}`,
      };
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
