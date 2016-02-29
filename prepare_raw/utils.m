## Copyright (C) 2015 dev
##
## This program is free software; you can redistribute it and/or modify it
## under the terms of the GNU General Public License as published by
## the Free Software Foundation; either version 3 of the License, or
## (at your option) any later version.
##
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU General Public License for more details.
##
## You should have received a copy of the GNU General Public License
## along with this program.  If not, see <http://www.gnu.org/licenses/>.

## -*- texinfo -*-
## @deftypefn {Function File} {@var{retval} =} estimateGravity (@var{x})
##
## @seealso{}
## @end deftypefn

## Author: dev <dev@devs-Mac.local>
## Created: 2015-03-22

TH = 0.1;
eps = 0.05;


function retval = segment(mode, overlap, timestamp, maxWindowSamples, wnMSecs)
  % Segment data on time windows
  iidx=[];
  X = [];
  sdx = 1; % starting window point
  edx = 1; % ending window point

    if ((exist('mode', 'var')==1) && (mode == 1))
      while (sdx <= (length(timestamp)-(2*maxWindowSamples)))
        % variable number of samples for fixed time window
        for n=1:maxWindowSamples
          if (timestamp(sdx+n)-timestamp(sdx) >= wnMSecs)

            edx = sdx + n;
            iidx = [iidx; sdx, edx];
            %fprintf('Entered: THR = %d, n=%d, sdx=%idx, edx=%idx, UPPER=%d\n', timestamp(sdx+n)-timestamp(sdx), n,sdx,edx, (length(signal)-(2*maxWindowSamples)) );

            % Use overalap pct to calculate the actual start id
            sdx = sdx + ceil(n * overlap);
            break;
          endif;
        endfor;
      endwhile;

    else
      while (sdx <= (length(timestamp)-(2*maxWindowSamples)))
        % fixed number of samples for variable non-overlapping time window

        edx = sdx + maxWindowSamples;
        iidx = [iidx; sdx, edx];
        %fprintf('Entered: THR = %d, sdx=%d, edx=%d\n', timestamp(edx)-timestamp(sdx), sdx, edx);

        % Use overalap pct to calculate the actual start id
        sdx = edx - ceil(maxWindowSamples * overlap) + 1;

      endwhile;
    endif;
    retval = iidx;

endfunction;

function retval = nextSegment(index, timestamp, width)
  % Segment data on time windows
  iidx=[];
  X = [];
  sdx = 1+ index; % starting window point
  edx = sdx + width; % ending window point
  if (sdx >= length(timestamp))
    retval = [];
    return;
  endif;

  if (sdx <= (length(timestamp)-(2*width)))
      retval = [iidx; sdx, edx];
  else
      printf("POSSIBLE ERROR!!!!\n start=%d - end=%d - len(timestamp)=%d - width=%d\n", sdx, edx, length(timestamp), width);
      retval = [iidx; sdx, length(timestamp)];
  endif;
endfunction;


function [V, H] = mizellEstimate (a, vg)
  d = a - vg;
  %keyboard;
  V = diag(d(:,:)*vg(:,:)')./diag(vg(:,:)*vg(:,:)');
  p = V .* vg(:,:);
  h = d - p;
  H = h(:, 1);
endfunction

function retval = ternary (expr, true_val, false_val)
    if (expr)
      retval = true_val;
    else
      retval = false_val;
    endif
endfunction

function [V, H] = testGravityNorm(timestamp, a)

  m = length(timestamp);
  eps = 0.03;
  threshold = 0.05;
  n = [];
  v = [];
  vv = [];
  widths = [4 8 16 32 64]; % can be
  width = widths(1);
  size (a);

  %keyboard;

  % Generate a vector for gravity using variable length windows
  ind = 1;
  iidA = nextSegment(ind, timestamp, width);

  while (length(iidA) == 2)
    %fprintf("ENTERED\n");

        frame = a(iidA(1, 1):iidA(1, 2), :, :);
        vg = mean(frame);
        varg = var(frame);
        no = norm(vg);
        v = [v, varg];

        if ((no <= (1 + eps)) && (no >= (1 -eps)))
          %keyboard;
          %fprintf("ENTERED Normal: %f\n", no);
          pos = find(widths == width);
          nextInd = ternary((pos - 1) <= 1, pos, pos-1);
          width = widths(nextInd);
          slice = ones(1, length(frame))*no;
          slicev = repmat(vg, length(frame), 1);
        else

          if (varg > threshold)
            % Movement pattern, needs to enlarge observation window
            %fprintf("ENTERED");
            pos = find(widths == width);
            %nextInd1 = ternary((pos + 1) >= length(widths), pos, pos+1);
            nextInd1 = ternary((pos + 1) >= length(widths), pos, pos+1);
            width = widths(nextInd1);
          endif

          if (length(n) > 0)
            last_no = n(end);
            last_vg = vv(end, :);
          else
            last_no = no;
            last_vg = vg;
          endif;
          slice = ones(1, length(frame))*last_no;
          slicev = repmat(last_vg, length(frame), 1);

        endif
        n = [n, slice];
        vv = [vv; slicev];

        iidA = nextSegment(iidA(2), timestamp, width);
  endwhile;
% Calculate V and H using estimated gravity vectory

  %keyboard;
  vv = [vv; repmat(0, abs(length(a)-length(vv)), 3)];
  maxInd = max(length(a), length(vv));
  temp_v = vv(1:maxInd, :);
  [V, H] = mizellEstimate(a, temp_v);

%  figure;
%%  plot(V, 'r');
%  hold on;
%  plot(H, 'b');
%  title ("Vertical and Horizontal components of the gravity");
%%  xlabel ("Time");
%  ylabel ("Acceleration (in g)");


endfunction;
